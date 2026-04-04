package com.example.comp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileDTO {
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
}