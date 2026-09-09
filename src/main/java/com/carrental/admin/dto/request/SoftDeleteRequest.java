package com.carrental.admin.dto.request;

import jakarta.validation.constraints.Size;

public record SoftDeleteRequest(
        @Size(max = 2000, message = "Reason must not exceed 2000 characters")
        String reason
) {}


