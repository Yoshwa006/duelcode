package com.example.comp.enums;

public enum Difficulty {
    EASY(10),
    MEDIUM(20),
    HARD(30);

    private final int score;

    Difficulty(int score) {
        this.score = score;
    }

    public int getScore() {
        return score;
    }
}

