package com.example.comp.controller;

import com.example.comp.dto.chat.ChatMessage;
import com.example.comp.service.ChatMessagingService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
public class ChatSocketController {

    private final ChatMessagingService chatMessagingService;

    public ChatSocketController(ChatMessagingService chatMessagingService) {
        this.chatMessagingService = chatMessagingService;
    }

    @MessageMapping("/chat/match/{token}")
    public void sendMatchMessage(@DestinationVariable("token") String token, ChatMessage message) {
        message.setType("MATCH");
        message.setMatchToken(token);
        message.setTimestamp(Instant.now().toString());
        chatMessagingService.sendMatchMessage(token, message);
    }

    @MessageMapping("/chat/direct")
    public void sendDirectMessage(ChatMessage message) {
        message.setType("DIRECT");
        message.setTimestamp(Instant.now().toString());
        if (message.getRecipientId() != null) {
            chatMessagingService.sendDirectMessage(message.getRecipientId(), message);
        }
        if (message.getSenderId() != null) {
            chatMessagingService.echoToSender(message.getSenderId(), message);
        }
    }
}
