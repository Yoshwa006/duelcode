package com.example.comp.model;

import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.elasticsearch.annotations.Document;

import java.util.UUID;

@Document(indexName = "questions")
@Getter
@Setter

public class QuestionElastic {
    @Id
    private UUID id;
    private String title;
    private String description;
    private String difficulty;
    private String stdIn;
    private String expectedOutput;
}
