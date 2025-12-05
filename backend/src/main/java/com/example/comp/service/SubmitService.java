package com.example.comp.service;

import com.example.comp.dto.*;
import com.example.comp.mapper.Mapper;
import com.example.comp.model.Session;
import com.example.comp.model.Users;
import com.example.comp.repo.SessionRepo;
import com.example.comp.component.CurrentUser;
import com.example.comp.enums.Status;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
public class SubmitService {

    private final WebClient client;
    private final SessionRepo sessionRepo;
    private final CurrentUser currentUser;

    public SubmitService(SessionRepo sessionRepo, CurrentUser currentUser,
                         @org.springframework.beans.factory.annotation.Value("${judge.api.url:http://localhost:3001}") String judgeApiUrl) {
        this.client = WebClient.builder()
                .baseUrl(judgeApiUrl)
                .build();
        this.sessionRepo = sessionRepo;
        this.currentUser = currentUser;
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
            res.setStatus("success");
            res.setMessage("Correct answer. You won the battle");
            return res;
        }

        res.setStatus("failure");
        res.setMessage("Wrong answer");
        return res;
    }

    private boolean isUserInSession(int userId, Session session) {
        return (session.getCreatedBy() != null && session.getCreatedBy().getId() == userId)
                || (session.getJoinedBy() != null && session.getJoinedBy().getId() == userId);
    }

    private JudgeResponse runJudge(SubmitAPI submission) {
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
