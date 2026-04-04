package com.example.comp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private int id;
    private String email;
    private String username;
    private String country;
    private String city;
    private String organization;
    private String avatarUrl;
    private String website;
    private String twitter;
    private String github;
    private String linkedin;
    private String bio;
    private Integer rating;
    private Integer maxRating;
    private String rank;
    private String maxRank;
    private Integer contribution;
    private Integer friendCount;
    private Long registrationTime;
    private Long lastOnlineTime;
    private Integer problemCount;
    private Integer contestCount;
    private Integer solvedCount;
    private Integer submissionCount;
    private Integer eloRating;
    private Integer rankedWins;
    private Integer rankedLosses;
    private Long totalScore;
    private Integer questionsSolved;
    private Long totalSolveTime;
    private Integer easySolved;
    private Integer mediumSolved;
    private Integer hardSolved;
    private Integer totalContests;
    private Integer contestsWon;
    private Boolean isFriend;
    private Boolean hasPendingRequest;
}