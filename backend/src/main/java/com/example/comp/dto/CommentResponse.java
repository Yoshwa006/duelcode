package com.example.comp.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CommentResponse(
                UUID id,
                String content,
                String authorName,
                UUID parentId,
                LocalDateTime createdAt,
                List<CommentResponse> replies) {
}