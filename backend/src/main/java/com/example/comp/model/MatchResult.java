package com.example.comp.model;

import com.example.comp.enums.BattleType;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
public class MatchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID sessionId;

    @ManyToOne
    private Users player1;

    @ManyToOne
    private Users player2;

    @ManyToOne
    private Users winner;

    @Enumerated(EnumType.STRING)
    private BattleType battleType;

    private int scoreAwarded;
    private long durationSeconds;

    private Instant finishedAt;
}
