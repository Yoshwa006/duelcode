package com.example.comp.service;

import com.example.comp.dto.JudgeResponse;
import com.example.comp.dto.Mapper;
import com.example.comp.dto.SubmitAPI;
import com.example.comp.dto.SubmitRequest;
import com.example.comp.model.Session;
import com.example.comp.model.Users;
import com.example.comp.repo.SessionRepo;
import com.example.comp.repo.UserRepo;
import com.example.comp.util.CurrentUser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
public class SubmitService {

    private final WebClient client;
    private final SessionRepo sessionRepo;
    private final UserRepo userRepo;
    private final CurrentUser currentUser;

    public SubmitService(SessionRepo sessionRepo, UserRepo userRepo, CurrentUser currentUser) {
        this.client = WebClient.builder()
                .baseUrl("http://localhost:3001")
                .build();
        this.sessionRepo = sessionRepo;
        this.userRepo = userRepo;
        this.currentUser = currentUser;
    }

    public boolean submitCode(SubmitRequest request) {
        Session session = sessionRepo.findByToken(request.getToken());
        if (session == null) return false;
        if (session.getWho_won() != null) return false;

        Users user = currentUser.get();
        if (user == null) return false;
        if (!isUserInSession(user.getId(), session)) return false;

        SubmitAPI submission = Mapper.SubmitRequestToAPI(request);
        JudgeResponse result = runJudge(submission);
        if (result == null) return false;

        if ("Accepted".equalsIgnoreCase(result.getStatus())) {
            session.setWho_won(user);
            sessionRepo.save(session);
            return true;
        }

        return false;
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
