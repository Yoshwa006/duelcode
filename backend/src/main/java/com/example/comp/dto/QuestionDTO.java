package com.example.comp.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Setter
@Getter
public class QuestionDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private UUID id;
    private String title;
    private String description;
    private String difficulty;
    private String stdIn;
    private String expectedOutput;
}
