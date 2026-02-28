package com.example.comp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name="test_cases")
public class TestCases {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    String stdin;
    String expected_output;
    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

}
