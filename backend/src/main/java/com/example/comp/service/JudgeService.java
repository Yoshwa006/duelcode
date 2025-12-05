package com.example.comp.service;

import com.example.comp.dto.OperationStatusResponse;
import com.example.comp.model.Question;
import com.example.comp.model.Session;
import com.example.comp.model.Users;
import com.example.comp.repo.QuestionRepo;
import com.example.comp.repo.SessionRepo;
import com.example.comp.repo.UserRepo;
import com.example.comp.util.CurrentUser;
import com.example.comp.util.Status;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class JudgeService {

    @Autowired private SessionRepo sessionRepo;
    @Autowired private UserRepo userRepo;
    @Autowired private QuestionRepo questionRepo;
    @Autowired private CurrentUser currentUser;

    private static final String TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int TOKEN_LENGTH = 4;
    private static final int MAX_ATTEMPTS = 32;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private String newToken() {
        char[] tokenChars = new char[TOKEN_LENGTH];

        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            for (int i = 0; i < TOKEN_LENGTH; i++) {
                tokenChars[i] = TOKEN_CHARS.charAt(SECURE_RANDOM.nextInt(TOKEN_CHARS.length()));
            }
            String token = new String(tokenChars);
            if (!sessionRepo.existsByToken(token)) {
                return token;
            }
        }
        // fallback: use a rare value to ensure uniqueness, as a last resort
        String fallbackToken = Long.toString(Math.abs(SECURE_RANDOM.nextLong()), 36).toUpperCase();
        log.warn("Exhausted {} attempts to generate unique token, using fallback [{}]", MAX_ATTEMPTS, fallbackToken);
        return fallbackToken;
    }

    public String generateKey(UUID quesId) {
        Question question = questionRepo.findById(quesId)
                .orElseThrow(() -> new RuntimeException("Invalid question id: " + quesId));

        Users user = currentUser.get();
        if (user == null) throw new RuntimeException("User not authenticated");

        String token = newToken();
        sessionRepo.save(new Session(token, user, question));

        log.info("Generated Token: {}", token);
        return token;
    }

    private boolean joinSession(Session session) {
        if (session == null || session.getJoinedBy() != null) return false;

        Users user = currentUser.get();
        if (user == null) return false;

        session.setJoinedBy(user);
        session.setStatus(Status.STATUS_PLAYING);
        sessionRepo.save(session);
        return true;
    }

    public boolean joinRandom() {
        return joinSession(sessionRepo.findTopByJoinedByIsNullOrderByCreatedAtDesc());
    }

    public OperationStatusResponse enterToken(String token) {
        OperationStatusResponse res = new OperationStatusResponse();

        Session session = sessionRepo.findByToken(token);
        if (session == null) {
            res.setStatus("FAILED");
            res.setMessage("Session not found");
            res.setErrorCode(404);
            return res;
        }

        boolean joined = joinSession(session);

        if (!joined) {
            res.setStatus("FAILED");
            res.setMessage("Failed to join session");
            res.setErrorCode(400);
            return res;
        }

        res.setStatus("SUCCESS");
        res.setMessage("Joined session successfully");
        res.setErrorCode(0);
        return res;
    }

}
