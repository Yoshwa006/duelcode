package com.example.comp.service;

import com.example.comp.component.CurrentUser;
import com.example.comp.dto.JudgeResponse;
import com.example.comp.dto.OperationStatusResponse;
import com.example.comp.dto.SubmitAPI;
import com.example.comp.dto.SubmitRequest;
import com.example.comp.enums.Status;
import com.example.comp.events.BattleEventPublisher;
import com.example.comp.mapper.Mapper;
import com.example.comp.model.Session;
import com.example.comp.model.TestCases;
import com.example.comp.model.Users;
import com.example.comp.repo.SessionRepo;
import com.example.comp.repo.TestCasesRepo;
import com.example.comp.repo.UserStatsRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Slf4j
@Service
public class SubmitService {

    private final WebClient client;
    private final SessionRepo sessionRepo;
    private final CurrentUser currentUser;
    private final TestCasesRepo testCasesRepo;
    private final UserStatsRepo userStatsRepo;
    private final BattleEventPublisher battleEventPublisher;
    public SubmitService(SessionRepo sessionRepo, CurrentUser currentUser, TestCasesRepo testCasesRepo,
                         UserStatsRepo userStatsRepo,
                         BattleEventPublisher battleEventPublisher,
                         @org.springframework.beans.factory.annotation.Value("${judge.api.url:http://localhost:3001}") String judgeApiUrl) {
        this.client = WebClient.builder()
                .baseUrl(judgeApiUrl)
                .build();
        this.sessionRepo = sessionRepo;
        this.testCasesRepo = testCasesRepo;
        this.currentUser = currentUser;
        this.userStatsRepo = userStatsRepo;
        this.battleEventPublisher = battleEventPublisher;
    }

    public OperationStatusResponse submitCode(SubmitRequest request) {

        OperationStatusResponse res = new OperationStatusResponse();

        Session session = sessionRepo.findByToken(request.getToken());
        if (session == null) {
            res.setStatus("failure");
            res.setMessage("Session does not exist");
            return res;
        }

        if (session.getWho_won() != null) {
            res.setStatus("failure");
            res.setMessage("Battle already completed");
            return res;
        }

        Users user = currentUser.get();
        if (user == null) {
            res.setStatus("failure");
            res.setMessage("Invalid user");
            return res;
        }

        if (!isUserInSession(user.getId(), session)) {
            res.setStatus("failure");
            res.setMessage("You are not part of this session");
            return res;
        }

        SubmitAPI submission = Mapper.SubmitRequestToAPI(request);
        List<TestCases> tc = testCasesRepo.findByQuestionId(request.getQuestion().getId());
        if (tc == null || tc.isEmpty()) {
            res.setStatus("failure");
            res.setMessage("No test cases found for question");
            return res;
        }
        TestCases testCase = tc.get(0);

        submission.setStdin(testCase.getStdin());
        submission.setExpected_output(testCase.getExpected_output());
        JudgeResponse result = runJudge(submission);

        if (result == null) {
            res.setStatus("failure");
            res.setMessage("Judge API failed");
            return res;
        }


        if ("Accepted".equalsIgnoreCase(result.getStatus())) {
            session.setWho_won(user);
            session.setStatus(Status.STATUS_COMPLETED);
            sessionRepo.save(session);

            //publish for leaderboard things
            battleEventPublisher.publishBattleFinished(session.getId());

            res.setStatus("success");
            res.setMessage("Correct answer. You won the battle");
            return res;
        }

        res.setStatus("failure");
        res.setMessage("Wrong answer");
        return res;
    }

    /**
     * Checks if user created or joined session
     */
    private boolean isUserInSession(int userId, Session session) {
        return (session.getCreatedBy() != null && session.getCreatedBy().getId() == userId)
                || (session.getJoinedBy() != null && session.getJoinedBy().getId() == userId);
    }

    private JudgeResponse runJudge(SubmitAPI submission) {
        // Executes external judge API; handles failures
        try {
            return client.post()
                    .uri("/run-code")
                    .bodyValue(submission)
                    .retrieve()
                    .bodyToMono(JudgeResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("Judge API failed", e);
            return null;
        }
    }
}
