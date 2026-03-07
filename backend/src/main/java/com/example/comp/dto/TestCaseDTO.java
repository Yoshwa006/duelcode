package com.example.comp.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Setter
@Getter
public class TestCaseDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private UUID id;
    private String stdin;
    private String expectedOutput;
}
