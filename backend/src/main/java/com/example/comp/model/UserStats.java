package com.example.comp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Setter
@Getter

public class UserStats {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private int elo;

    private int rankedWins;
    private int rankedLosses;
    private int questionsSolved;
    private int totalScore;

    private long totalSolveTime;

    private int season;
}
