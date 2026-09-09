package com.carrental.admin.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PendingOwnerDriverResponse(
        Long driverProfileId,
        Long userId,
        String fullName,
        String email,
        String mobileNumber,
        String businessName,
        String licenseNumber,
        LocalDate licenseExpiryDate,
        LocalDateTime submittedAt
) {}


