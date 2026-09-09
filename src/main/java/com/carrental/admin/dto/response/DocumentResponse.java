package com.carrental.admin.dto.response;

import java.time.LocalDateTime;

public record DocumentResponse(
        Long documentId,
        String documentType,
        String fileUrl,
        Boolean isPrimary,
        LocalDateTime uploadedAt
) {}


