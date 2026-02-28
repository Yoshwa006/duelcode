package com.example.comp.service;

import com.example.comp.enums.EloResult;
import com.example.comp.model.*;
import com.example.comp.repo.UserStatsRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class LeaderboardService {

    private final UserStatsRepo userStatsRepo;
    private final EloService eloService;

    public LeaderboardService(UserStatsRepo userStatsRepo, EloService eloService) {
        this.userStatsRepo = userStatsRepo;
        this.eloService = eloService;
    }

    @Transactional
    public void updateAfterRankedMatch(Users winner, Users loser, Session session) {

        UserStats winnerStats = getOrCreate(winner.getId());
        UserStats loserStats = getOrCreate(loser.getId());

        int score = session.getQuestion().getScore();

        // wins / losses
        winnerStats.setRankedWins(winnerStats.getRankedWins() + 1);
        loserStats.setRankedLosses(loserStats.getRankedLosses() + 1);

        // score
        winnerStats.setTotalScore(winnerStats.getTotalScore() + score);
        winnerStats.setQuestionsSolved(winnerStats.getQuestionsSolved() + 1);

        // elo update
        EloResult elo = eloService.calculate(
                winnerStats.getEloRating(),
                loserStats.getEloRating()
        );

        winnerStats.setEloRating(elo.winner());
        loserStats.setEloRating(elo.loser());

        userStatsRepo.save(winnerStats);
        userStatsRepo.save(loserStats);
    }

    public Users getOpponent(Session session, Users current) {
        return session.getCreatedBy().equals(current)
                ? session.getJoinedBy()
                : session.getCreatedBy();
    }

    private UserStats getOrCreate(int userId) {
        return userStatsRepo.findByUserId(userId)
                .orElseGet(() -> {
                    UserStats s = new UserStats();
                    s.setUserId(userId);
                    return userStatsRepo.save(s);
                });
    }
}
