package com.example.comp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter

public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private String bio;
    private Long dateOfBirth;
    private Long lastUpdatedAt;
    private Long createdAt;
    private Integer contestRating;


    @OneToMany
    @JoinColumn(name="user_friends")
    Set<Users> user_friends;    

}
