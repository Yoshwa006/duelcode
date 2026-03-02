package com.example.comp.controller;

import com.example.comp.dto.CommentResponse;
import com.example.comp.dto.CreateCommentRequest;
import com.example.comp.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions/{questionId}/comments")
public class CommentController {

    private final QuestionService questionService;

    @Autowired
    public CommentController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public Page<CommentResponse> getComments(@PathVariable("questionId") java.util.UUID questionId, Pageable pageable) {
        return questionService.getComments(questionId, pageable);
    }

    @PostMapping
    public CommentResponse addComment(@PathVariable("questionId") java.util.UUID questionId,
            @RequestBody CreateCommentRequest request) {
        return questionService.create(questionId, request);
    }
}
