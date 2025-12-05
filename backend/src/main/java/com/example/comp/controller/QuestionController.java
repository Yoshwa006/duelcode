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
    public ResponseEntity<?> getQuestionById(@PathVariable UUID id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @PostMapping
    public ResponseEntity<String> saveQuestion(@RequestBody QuestionElastic request) {
        try {
            String result = questionService.saveQuestion(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error occurred while saving question: " + e.getMessage());
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
    public ResponseEntity<Boolean> existsByTitle(@PathVariable String title){
        boolean exists = questionService.containsByTitle(title);
        return ResponseEntity.ok(exists);
    }

}
