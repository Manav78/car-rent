package com.carrental.admin.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DriverSummaryResponse(
        Long driverId,
        Long userId,
        String fullName,
        String email,
        String mobileNumber,
        String licenseNumber,
        LocalDate licenseExpiryDate,
        String approvalStatus,
        String operationalStatus,
        String managingOwnerName,
        String managingOwnerEmail,
        LocalDateTime createdAt
) {}


