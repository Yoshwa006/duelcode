package com.example.comp.controller;

import com.example.comp.dto.QuestionDTO;
import com.example.comp.model.QuestionElastic;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.comp.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/question")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @GetMapping
    public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionById(@RequestBody @PathVariable UUID id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @PostMapping
    public String saveQuestion(@RequestBody QuestionElastic request) {
        try {
            String result = questionService.saveQuestion(request);
            return result;
        } catch (Exception e) {
            return "exception";
        }
    }

    @GetMapping("/title/{name}")
    public ResponseEntity<?> getByTitle(@PathVariable String name) {
        QuestionElastic question = questionService.findByQuestionName(name);

        if (question == null) {
            return ResponseEntity.status(404).body("No question found with title: " + name);
        }

        return ResponseEntity.ok(question);
    }

    @GetMapping("/existsByTitle/{title}")
    public boolean existsByTitle(@PathVariable String title){
        boolean test = questionService.containsByTitle(title);

        return test;
    }

}
