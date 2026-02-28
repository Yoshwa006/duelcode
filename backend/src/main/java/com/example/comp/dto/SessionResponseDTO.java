package com.example.comp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter

public class SessionResponseDTO {
    private String id;
    private String token;
    private String creatorEmail;
    private String createdUserName;
    private String joinedUserName;
    private String joinedByEmail;
    private String questionTitle;
    private String difficulty;
    private String status;
    private String createdAt;
}
