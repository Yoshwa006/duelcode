package com.example.comp.service;

import com.example.comp.dto.JudgeResponse;
import com.example.comp.dto.Mapper;
import com.example.comp.dto.SubmitAPI;
import com.example.comp.dto.SubmitRequest;
import com.example.comp.model.Session;
import com.example.comp.model.Users;
import com.example.comp.repo.SessionRepo;
import com.example.comp.repo.UserRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Slf4j
@Service
public class SubmitService {

    private final JwtService jwtService;
    private final WebClient client;
    private final SessionRepo sessionRepo;
    private final UserRepo userRepo;

    public SubmitService(SessionRepo sessionRepo, JwtService jwtService, UserRepo userRepo) {
        this.client = WebClient.builder()
                .baseUrl("http://localhost:3001")
                .build();
        this.sessionRepo = sessionRepo;
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }

    public boolean submitCode(SubmitRequest request) {
        String token = request.getToken();

        Session session = sessionRepo.findByToken(token);
        if (session == null) {
            logAllSessions(); // Log current DB state
            log.error("Session not found for token: {}", token);
            return false;
        }

        if (session.getWho_won().getId() != 0) {
            log.warn("Code already submitted for session by user id: {}", session.getWho_won());
            return false;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        Object principal = auth.getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            username = (String) principal;
        } else {
            return false;
        }
        Users user = userRepo.findByEmail(username);
        if(user == null){
            throw new RuntimeException("User not present !");
        }

        int userId = user.getId();
        if (!isUserInSession(userId, session)) {
            log.error("User {} not part of session {}", userId, token);
            return false;
        }

        SubmitAPI submission = Mapper.SubmitRequestToAPI(request);
        JudgeResponse result = runJudge(submission);
        if (result == null) return false;

        if ("Accepted".equalsIgnoreCase(result.getStatus())) {
            session.setWho_won(user);
            sessionRepo.save(session);
            log.info("Accepted: {}", result.getStdout());
            return true;
        }

        log.info("Not accepted. Status: {}", result.getStatus());
        return false;
    }

    private boolean isUserInSession(int userId, Session session) {
        return userId == session.getCreatedBy() .getId()|| userId == session.getJoinedBy().getId();
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

    private void logAllSessions() {
        List<Session> sessions = sessionRepo.findAll();
        log.error("Current sessions in DB: {}", sessions);
    }

}

