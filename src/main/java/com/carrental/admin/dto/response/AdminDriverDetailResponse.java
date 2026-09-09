package com.carrental.admin.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AdminDriverDetailResponse(
        Long driverId,
        Long userId,
        String fullName,
        String email,
        String mobileNumber,
        String profilePhotoUrl,
        String licenseNumber,
        LocalDate licenseExpiryDate,
        String approvalStatus,
        String operationalStatus,
        String rejectionReason,

        Long ownerId,
        String ownerName,
        String ownerEmail,

        List<DocumentResponse> documents,
        List<ApprovalRecordResponse> approvalHistory,

        LocalDateTime createdAt
) {}


