package com.example.comp.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitRequest {

    String source_code;
    int language_id;
    String stdin;
    String expected_output;
    String token;
}