package com.example.comp.dto;


import com.example.comp.model.Question;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitRequest {

    String source_code;
    int language_id;
    Question question;
    String token;
}