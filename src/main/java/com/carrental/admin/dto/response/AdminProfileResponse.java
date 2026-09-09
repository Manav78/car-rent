package com.carrental.admin.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record AdminProfileResponse(
        Long id,
        String fullName,
        String email,
        String mobileNumber,
        List<String> roles,
        LocalDateTime createdAt
) {}


