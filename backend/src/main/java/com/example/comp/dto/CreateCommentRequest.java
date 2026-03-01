package com.example.comp.dto;

import java.util.UUID;

public record CreateCommentRequest(
        String content,
        UUID parentId
) {}