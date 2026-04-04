package com.example.comp.service;

import com.example.comp.component.CurrentUser;
import com.example.comp.dto.OperationStatusResponse;
import com.example.comp.dto.chat.ChatMessage;
import com.example.comp.enums.BattleType;
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

import java.time.Instant;
import java.security.SecureRandom;
import java.util.UUID;

@Slf4j
@Service
public class JudgeService {

    private static final String TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int TOKEN_LENGTH = 6;
    private static final int MAX_ATTEMPTS = 100;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final SessionRepo sessionRepo;
    private final QuestionRepo questionRepo;
    private final CurrentUser currentUser;
    private final ChatMessagingService chatMessagingService;

    @Autowired
    public JudgeService(SessionRepo sessionRepo, QuestionRepo questionRepo, CurrentUser currentUser,
            ChatMessagingService chatMessagingService) {
        this.sessionRepo = sessionRepo;
        this.questionRepo = questionRepo;
        this.currentUser = currentUser;
        this.chatMessagingService = chatMessagingService;
    }

    /**
     * Generates a unique token for a session.
     * 
     * @return unique session token
     */
    private String generateUniqueToken() {
        for (int attempt = 0; attempt < 100; attempt++) {
            char[] tokenChars = new char[TOKEN_LENGTH];
            for (int i = 0; i < TOKEN_LENGTH; i++) {
                tokenChars[i] = TOKEN_CHARS.charAt(SECURE_RANDOM.nextInt(TOKEN_CHARS.length()));
            }
            String token = new String(tokenChars);
            if (!sessionRepo.existsByToken(token)) {
                return token;
            }
        }
        throw new RuntimeException("Failed to generate unique token after 100 attempts");
    }

    /**
     * Generates and stores a new session key for the specified question ID.
     * 
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

        // Check if user already has an active session
        Session existingSession = sessionRepo.findSessionsForUser(user.getId());
        if (existingSession != null) {
            throw new IllegalStateException("You are already in an active battle. Please complete or wait for it to finish.");
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
     * 
     * @param session The session to join.
     * @return true if joined successfully, false otherwise.
     */
    @Transactional
    protected boolean joinSession(Session session, boolean isFriendly) {
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
            log.debug("joinSession failed: User [{}] cannot join their own session [{}].", user.getId(),
                    session.getId());
            return false;
        }
        if (isFriendly) {
            session.setBattleType(BattleType.FRIENDLY);
        } else {
            session.setBattleType(BattleType.RANKED);
        }
        session.setJoinedBy(user);
        session.setStatus(Status.STATUS_PLAYING);
        session.setStartedAt(Instant.now());
        sessionRepo.save(session);
        chatMessagingService.notifyMatchStarted(session);

        log.info("User [{}] successfully joined session [{}]", user.getId(), session.getId());
        return true;
    }

    /**
     * Find and join the latest available session for the user.
     * 
     * @return true if joined, false otherwise.
     */
    @Transactional
    public boolean joinRandom() {
        Session session = sessionRepo.findTopByJoinedByIsNullOrderByCreatedAtDesc();
        boolean joined = joinSession(session, false);
        if (!joined) {
            log.info("No available sessions to join for user [{}].",
                    (currentUser.get() != null ? currentUser.get().getId() : null));
        }
        return joined;
    }

    /**
     * Attempt to enter and join a session by token string.
     * Returns a well-formed OperationStatusResponse for API consumption.
     * 
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

        boolean joined = joinSession(session, true);
        if (!joined) {
            res.setStatus("FAILED");
            res.setMessage("Failed to join session. It may already have been joined or you are not allowed to join.");
            res.setErrorCode(400);
            log.warn("Failed to join session with token [{}] for user [{}]", token,
                    (currentUser.get() != null ? currentUser.get().getId() : null));
            return res;
        }

        res.setStatus("SUCCESS");
        res.setMessage("Joined session successfully.");
        res.setErrorCode(0);
        log.info("User [{}] joined session successfully with token [{}]",
                (currentUser.get() != null ? currentUser.get().getId() : null), token);
        return res;
    }

    @Transactional
    public OperationStatusResponse surrender(String token) {
        OperationStatusResponse res = new OperationStatusResponse();
        
        if (token == null || token.trim().isEmpty()) {
            res.setStatus("FAILED");
            res.setMessage("Token is required");
            res.setErrorCode(400);
            return res;
        }

        Session session = sessionRepo.findByToken(token.trim());
        if (session == null) {
            res.setStatus("FAILED");
            res.setMessage("Session not found");
            res.setErrorCode(404);
            return res;
        }

        Users currentUser = this.currentUser.get();
        if (currentUser == null) {
            res.setStatus("FAILED");
            res.setMessage("Not authenticated");
            res.setErrorCode(401);
            return res;
        }

        Users opponent = null;
        int userId = currentUser.getId();
        if (session.getCreatedBy() != null && session.getCreatedBy().getId() == userId) {
            opponent = session.getJoinedBy();
        } else if (session.getJoinedBy() != null && session.getJoinedBy().getId() == userId) {
            opponent = session.getCreatedBy();
        }

        if (opponent != null) {
            session.setWho_won(opponent);
            session.setStatus(Status.STATUS_COMPLETED);
            sessionRepo.save(session);
            
            ChatMessage sysMsg = new ChatMessage();
            sysMsg.setType("SYSTEM");
            sysMsg.setContent("User " + currentUser.getUsername() + " surrendered! " + opponent.getUsername() + " wins!");
            sysMsg.setSenderId(currentUser.getId());
            chatMessagingService.sendMatchMessage(token, sysMsg);
        }

        res.setStatus("SUCCESS");
        res.setMessage("You surrendered. The match is over.");
        res.setErrorCode(0);
        return res;
    }
}
