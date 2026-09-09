package com.carrental.admin.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record DeletedAccountResponse(
        Long userId,
        String fullName,
        String email,
        String mobileNumber,
        String accountOrigin,
        List<String> roles,
        String deleteReason,
        String deletedByName,
        LocalDateTime deletedAt,
        LocalDateTime createdAt
) {}


