package com.example.comp.events;

import com.example.comp.enums.BattleType;
import com.example.comp.model.*;
import com.example.comp.repo.*;
import com.example.comp.service.LeaderboardService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Component
public class BattleFinishedListener {

    private final SessionRepo sessionRepo;
    private final MatchResultRepo matchResultRepo;
    private final LeaderboardService leaderboardService;

    public BattleFinishedListener(
            SessionRepo sessionRepo,
            MatchResultRepo matchResultRepo,
            LeaderboardService leaderboardService
    ) {
        this.sessionRepo = sessionRepo;
        this.matchResultRepo = matchResultRepo;
        this.leaderboardService = leaderboardService;
    }

    @Async
    @Transactional
    @EventListener
    public void onBattleFinished(BattleFinishedEvent event) {

        UUID sessionId = event.getSessionId();
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalStateException("Session not found: " + sessionId));

        Users winner = session.getWho_won();
        if (winner == null) {
            log.warn("Battle finished but no winner found for session: {}", sessionId);
            return;
        }
        Users loser = leaderboardService.getOpponent(session, winner);
        if (loser == null) {
            log.warn("Battle finished but no opponent found for session: {}", sessionId);
            return;
        }

        // Store immutable history
        matchResultRepo.save(MatchResult.fromSession(session));

        // Ignore friendly battles
        if (session.getBattleType() == BattleType.FRIENDLY) {
            return;
        }

        leaderboardService.updateAfterRankedMatch(winner, loser, session);
    }
}
