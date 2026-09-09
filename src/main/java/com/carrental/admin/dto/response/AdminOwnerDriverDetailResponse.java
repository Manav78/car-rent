package com.carrental.admin.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AdminOwnerDriverDetailResponse(
        Long driverProfileId,
        Long userId,
        String fullName,
        String email,
        String mobileNumber,
        String businessName,
        String licenseNumber,
        LocalDate licenseExpiryDate,
        String approvalStatus,
        String rejectionReason,

        List<DocumentResponse> documents,
        List<ApprovalRecordResponse> approvalHistory,

        LocalDateTime createdAt
) {}


