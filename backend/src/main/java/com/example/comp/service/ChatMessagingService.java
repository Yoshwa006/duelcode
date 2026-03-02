package com.example.comp.service;

import com.example.comp.dto.chat.ChatMessage;
import com.example.comp.model.Session;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ChatMessagingService {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatMessagingService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendMatchMessage(String matchToken, ChatMessage message) {
        ensureTimestamp(message);
        messagingTemplate.convertAndSend("/topic/match/" + matchToken, message);
    }

    public void sendDirectMessage(Integer recipientId, ChatMessage message) {
        ensureTimestamp(message);
        messagingTemplate.convertAndSendToUser(String.valueOf(recipientId), "/queue/messages", message);
    }

    public void echoToSender(Integer senderId, ChatMessage message) {
        ensureTimestamp(message);
        messagingTemplate.convertAndSendToUser(String.valueOf(senderId), "/queue/messages", message);
    }

    public void notifyMatchStarted(Session session) {
        if (session == null || session.getToken() == null) {
            return;
        }
        ChatMessage message = new ChatMessage();
        message.setType("SYSTEM");
        message.setContent("MATCH_STARTED");
        message.setMatchToken(session.getToken());
        message.setSenderId(session.getCreatedBy() != null ? session.getCreatedBy().getId() : null);
        message.setRecipientId(session.getJoinedBy() != null ? session.getJoinedBy().getId() : null);
        ensureTimestamp(message);
        messagingTemplate.convertAndSend("/topic/match/" + session.getToken(), message);
    }

    private void ensureTimestamp(ChatMessage message) {
        if (message.getTimestamp() == null || message.getTimestamp().isBlank()) {
            message.setTimestamp(Instant.now().toString());
        }
    }
}
