package com.example.comp.model;


import com.example.comp.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

@Table(name = "session")
public class Session {


    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "created_by")
    private Users createdBy;

    private Instant createdAt;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne
    @JoinColumn(name = "joined_by")
    private Users joinedBy;

    @OneToOne
    @JoinColumn(name = "who_won")
    private Users who_won;

    @OneToOne
    @JoinColumn(name = "question_id")
    private Question question;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;

    public Session(String token, Users createdBy, Question question) {
        this.token = token;
        this.createdBy = createdBy;
        this.question = question;
        this.createdAt=Instant.now();
        this.status = Status.STATUS_ACTIVE;
    }

}
