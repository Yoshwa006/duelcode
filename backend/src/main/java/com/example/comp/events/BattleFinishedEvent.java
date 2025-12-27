package com.example.comp.events;

import java.util.UUID;

public class BattleFinishedEvent {

    private final UUID sessionId;

    public BattleFinishedEvent(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public UUID getSessionId() {
        return sessionId;
    }
}
