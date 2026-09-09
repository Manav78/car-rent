package com.carrental.admin.dto.response;

import java.time.LocalDateTime;

public record AdminNotificationResponse(
        Long id,
        String notificationType,
        String title,
        String message,
        String referenceType,
        Long referenceId,
        Boolean isRead,
        LocalDateTime readAt,
        LocalDateTime createdAt
) {}


