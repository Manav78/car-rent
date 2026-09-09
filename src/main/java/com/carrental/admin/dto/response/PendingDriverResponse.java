package com.carrental.admin.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PendingDriverResponse(
        Long driverId,
        Long userId,
        String fullName,
        String email,
        String mobileNumber,
        String licenseNumber,
        LocalDate licenseExpiryDate,

        Long ownerId,
        String ownerName,
        String ownerEmail,

        LocalDateTime submittedAt
) {}


