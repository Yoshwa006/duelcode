package com.example.comp.events;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class BattleEventPublisher {

    private final ApplicationEventPublisher publisher;

    public BattleEventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void publishBattleFinished(UUID sessionId) {
        publisher.publishEvent(new BattleFinishedEvent(sessionId));
    }
}
