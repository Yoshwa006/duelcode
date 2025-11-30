package com.example.comp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SessionSearchRequestDTO {
    private String creatorEmail;
    private String createdUserName;
    private String joinedUserName;
    private String joinedByEmail;
    private String difficulty;
    private String status;
    private String startDate;
    private String endDate;
    private Integer page = 0;
    private Integer size = 10;
    private String sortBy = "createdAt";
    private String direction = "DESC";
}