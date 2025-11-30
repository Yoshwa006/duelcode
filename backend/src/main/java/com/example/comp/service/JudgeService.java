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

    private String newToken() {
        final String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();

        String token;
        do {
            token = random.ints(4, 0, chars.length())
                    .mapToObj(i -> String.valueOf(chars.charAt(i)))
                    .collect(Collectors.joining());
        } while (sessionRepo.existsByToken(token));

        return token;
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
