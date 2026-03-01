package com.example.comp.controller;

import com.example.comp.dto.CommentResponse;
import com.example.comp.dto.CreateCommentRequest;
import com.example.comp.dto.QuestionDTO;
import com.example.comp.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping
    public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable UUID id) {
        return ResponseEntity.ok(questionService.getQuestionDTOById(id));
    }

    @PostMapping
    public ResponseEntity<QuestionDTO> createQuestion(
            @RequestBody QuestionDTO dto) {
        return ResponseEntity.ok(questionService.createQuestion(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionDTO> updateQuestion(
            @PathVariable UUID id,
            @RequestBody QuestionDTO dto) {
        return ResponseEntity.ok(questionService.updateQuestion(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<QuestionDTO>> bulkCreate(
            @RequestBody List<QuestionDTO> dtos) {
        return ResponseEntity.ok(questionService.bulkCreate(dtos));
    }

    @PutMapping("/bulk")
    public ResponseEntity<List<QuestionDTO>> bulkUpdate(
            @RequestBody List<QuestionDTO> dtos) {
        return ResponseEntity.ok(questionService.bulkUpdate(dtos));
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<Void> bulkDelete(
            @RequestBody List<UUID> ids) {
        questionService.bulkDelete(ids);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{questionId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable UUID questionId,
            @RequestBody CreateCommentRequest request) {

        return ResponseEntity.ok(
                questionService.create(questionId, request)
        );
    }

    @GetMapping("/{questionId}/comments")
    public ResponseEntity<Page<CommentResponse>> getComments(
            @PathVariable UUID questionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                questionService.getComments(
                        questionId,
                        PageRequest.of(page, size, Sort.by("createdAt").descending())
                )
        );
    }

    @PutMapping("/{questionId}/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable UUID questionId,
            @PathVariable UUID commentId,
            @RequestBody String content) {

        return ResponseEntity.ok(
                questionService.update(questionId, commentId, content)
        );
    }

    @DeleteMapping("/{questionId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID questionId,
            @PathVariable UUID commentId) {

        questionService.delete(questionId, commentId);
        return ResponseEntity.noContent().build();
    }
}