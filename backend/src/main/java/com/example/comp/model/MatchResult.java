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

        Users loser = null;
        if (session.getWho_won() != null) {
            loser = session.getCreatedBy().getId() == session.getWho_won().getId()
                    ? session.getJoinedBy()
                    : session.getCreatedBy();
        }
        r.setLoser(loser);

        r.setBattleType(session.getBattleType());
        r.setScoreAwarded(session.getQuestion().getScore());
        r.setFinishedAt(Instant.now());
        return r;
    }
}
