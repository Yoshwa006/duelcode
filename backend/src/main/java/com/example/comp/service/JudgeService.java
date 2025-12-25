package com.example.comp.service;

import com.example.comp.component.CurrentUser;
import com.example.comp.dto.OperationStatusResponse;
import com.example.comp.enums.Status;
import com.example.comp.model.Question;
import com.example.comp.model.Session;
import com.example.comp.model.Users;
import com.example.comp.repo.QuestionRepo;
import com.example.comp.repo.SessionRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.UUID;

@Slf4j
@Service
public class JudgeService {

    private static final String TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int TOKEN_LENGTH = 4;
    private static final int MAX_ATTEMPTS = 32;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final SessionRepo sessionRepo;
    private final QuestionRepo questionRepo;
    private final CurrentUser currentUser;

    @Autowired
    public JudgeService(SessionRepo sessionRepo, QuestionRepo questionRepo, CurrentUser currentUser) {
        this.sessionRepo = sessionRepo;
        this.questionRepo = questionRepo;
        this.currentUser = currentUser;
    }

    /**
     * Generates a unique token for a session.
     * @return unique session token
     */
    private String generateUniqueToken() {
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
        // Fallback in the very rare case of exhaustion
        String fallbackToken = Long.toString(Math.abs(SECURE_RANDOM.nextLong()), 36).toUpperCase();
        log.warn("Exhausted {} attempts to generate unique token, using fallback [{}]", MAX_ATTEMPTS, fallbackToken);
        return fallbackToken;
    }

    /**
     * Generates and stores a new session key for the specified question ID.
     * @param quesId the question UUID
     * @return generated session token
     */
    @Transactional
    public String generateKey(UUID quesId) {
        if (quesId == null) {
            throw new IllegalArgumentException("Question ID must not be null.");
        }

        Question question = questionRepo.findById(quesId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid question id: " + quesId));

        Users user = currentUser.get();
        if (user == null) {
            throw new SecurityException("User not authenticated");
        }

        String token = generateUniqueToken();
        Session session = new Session(token, user, question);

        sessionRepo.save(session);

        log.info("Generated new session token [{}] for user [{}] and question [{}]", token, user.getId(), quesId);
        return token;
    }

    /**
     * Attempt to join the given session for the currently authenticated user.
     * Handles session state and user logic.
     * @param session The session to join.
     * @return true if joined successfully, false otherwise.
     */
    @Transactional
    protected boolean joinSession(Session session) {
        if (session == null) {
            log.debug("joinSession failed: Provided session is null.");
            return false;
        }
        if (session.getJoinedBy() != null) {
            log.debug("joinSession failed: Session [{}] already joined by another user.", session.getId());
            return false;
        }

        Users user = currentUser.get();
        if (user == null) {
            log.debug("joinSession failed: No authenticated user.");
            return false;
        }

        // Prevent the session creator from joining their own session
        if (session.getCreatedBy() != null && session.getCreatedBy().getId() == (user.getId())) {
            log.debug("joinSession failed: User [{}] cannot join their own session [{}].", user.getId(), session.getId());
            return false;
        }

        session.setJoinedBy(user);
        session.setStatus(Status.STATUS_PLAYING);
        sessionRepo.save(session);

        log.info("User [{}] successfully joined session [{}]", user.getId(), session.getId());
        return true;
    }

    /**
     * Find and join the latest available session for the user.
     * @return true if joined, false otherwise.
     */
    @Transactional
    public boolean joinRandom() {
        Session session = sessionRepo.findTopByJoinedByIsNullOrderByCreatedAtDesc();
        boolean joined = joinSession(session);
        if (!joined) {
            log.info("No available sessions to join for user [{}].", (currentUser.get() != null ? currentUser.get().getId() : null));
        }
        return joined;
    }

    /**
     * Attempt to enter and join a session by token string.
     * Returns a well-formed OperationStatusResponse for API consumption.
     * @param token The session token to enter.
     * @return OperationStatusResponse
     */
    @Transactional
    public OperationStatusResponse enterToken(String token) {
        OperationStatusResponse res = new OperationStatusResponse();

        if (token == null || token.trim().isEmpty()) {
            res.setStatus("FAILED");
            res.setMessage("Token must not be null or empty.");
            res.setErrorCode(400);
            log.warn("Failed to enter session: Provided token is null or empty.");
            return res;
        }

        Session session = sessionRepo.findByToken(token.trim());
        if (session == null) {
            res.setStatus("FAILED");
            res.setMessage("Session not found.");
            res.setErrorCode(404);
            log.warn("Failed to enter session: No session found for token [{}]", token);
            return res;
        }

        boolean joined = joinSession(session);

        if (!joined) {
            res.setStatus("FAILED");
            res.setMessage("Failed to join session. It may already have been joined or you are not allowed to join.");
            res.setErrorCode(400);
            log.warn("Failed to join session with token [{}] for user [{}]", token, (currentUser.get() != null ? currentUser.get().getId() : null));
            return res;
        }

        res.setStatus("SUCCESS");
        res.setMessage("Joined session successfully.");
        res.setErrorCode(0);
        log.info("User [{}] joined session successfully with token [{}]", (currentUser.get() != null ? currentUser.get().getId() : null), token);
        return res;
    }
}
