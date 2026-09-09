package com.carrental.admin.dto.response;

import java.time.LocalDateTime;

public record OwnerSummaryResponse(
        Long ownerId,
        Long userId,
        String fullName,
        String email,
        String mobileNumber,
        String businessName,
        Boolean isActive,
        LocalDateTime createdAt
) {}


