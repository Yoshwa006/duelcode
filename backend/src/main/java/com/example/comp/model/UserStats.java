package com.example.comp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "user_stats")
@Getter
@Setter
public class UserStats {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private Users user;

    @Column(name = "elo_rating")
    private Integer eloRating = 1200;

    @Column(name = "ranked_wins")
    private Integer rankedWins = 0;

    @Column(name = "ranked_losses")
    private Integer rankedLosses = 0;

    @Column(name = "total_score")
    private Long totalScore = 0L;

    @Column(name = "questions_solved")
    private Integer questionsSolved = 0;

    @Column(name = "total_solve_time")
    private Long totalSolveTime = 0L;

    @Column(name = "easy_solved")
    private Integer easySolved = 0;

    @Column(name = "medium_solved")
    private Integer mediumSolved = 0;

    @Column(name = "hard_solved")
    private Integer hardSolved = 0;

    @Column(name = "total_contests")
    private Integer totalContests = 0;

    @Column(name = "contests_won")
    private Integer contestsWon = 0;

    private Integer points = 0;
}