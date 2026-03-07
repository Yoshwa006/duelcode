package com.example.comp.model;

import java.time.Instant;
import java.util.UUID;

import com.example.comp.enums.BattleType;
import com.example.comp.enums.Status;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @ManyToOne
    @JoinColumn(name = "created_by")
    private Users createdBy;

    private Instant createdAt;
    private Instant startedAt;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne
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

    @Enumerated(EnumType.STRING)
    private BattleType battleType;

    public Session(String token, Users createdBy, Question question) {
        this.token = token;
        this.createdBy = createdBy;
        this.question = question;
        this.createdAt = Instant.now();
        this.status = Status.STATUS_ACTIVE;
    }

}
