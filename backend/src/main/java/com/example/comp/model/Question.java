package com.example.comp.model;

import com.example.comp.enums.Difficulty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;
@Entity
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String title;
    private String description;

    @Enumerated()
    private Difficulty difficulty;
    private String stdIn;
    private String tags;
    private String expectedOutput;
    private int score;

    public List<TestCases> getTestCases() {
        return testCases;
    }

    public void setTestCases(List<TestCases> testCases) {
        this.testCases = testCases;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL)
    private List<TestCases> testCases;



    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
        this.score = (difficulty != null) ? difficulty.getScore() : 0;
    }

    @PrePersist
    @PreUpdate
    private void syncScore() {
        this.score = (this.difficulty != null) ? this.difficulty.getScore() : 0;
    }
    public Difficulty getDifficulty() {
        return difficulty;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStdIn() {
        return stdIn;
    }

    public void setStdIn(String stdIn) {
        this.stdIn = stdIn;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }


}
