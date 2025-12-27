package com.example.comp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "user_stats")
@Getter
@Setter
public class UserStats {

    @Id
    private int userId;

    private int eloRating = 1200;

    private int rankedWins;
    private int rankedLosses;

    private int totalScore;
    private int questionsSolved;

    private long totalSolveTime;
}
