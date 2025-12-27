package com.example.comp.model;

import com.example.comp.enums.BattleType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
public class MatchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID sessionId;

    @ManyToOne
    private Users winner;

    @ManyToOne
    private Users loser;

    @Enumerated(EnumType.STRING)
    private BattleType battleType;

    private int scoreAwarded;
    private long durationSeconds;

    private Instant finishedAt;

    public static MatchResult fromSession(Session session) {
        MatchResult r = new MatchResult();
        r.setSessionId(session.getId());
        r.setWinner(session.getWho_won());
        r.setLoser(null); // fill if needed
        r.setBattleType(session.getBattleType());
        r.setScoreAwarded(session.getQuestion().getScore());
        r.setFinishedAt(Instant.now());
        return r;
    }
}
