package com.example.comp.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String type;
    private String content;
    private String matchToken;
    private Integer senderId;
    private Integer recipientId;
    private String timestamp;
}
