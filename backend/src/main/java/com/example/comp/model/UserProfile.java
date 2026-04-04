package com.example.comp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private Users user;

    private String bio;

    private Long dateOfBirth;

    @Column(name = "last_updated_at")
    private Long lastUpdatedAt;

    @Column(name = "created_at")
    private Long createdAt;

    private Integer contestRating;

    private String title;
    private String about;

    @ElementCollection
    @CollectionTable(name = "user_friends", joinColumns = @JoinColumn(name = "user_profile_id"))
    @Column(name = "friend_id")
    private Set<Integer> friendIds = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = System.currentTimeMillis();
        lastUpdatedAt = System.currentTimeMillis();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdatedAt = System.currentTimeMillis();
    }
}