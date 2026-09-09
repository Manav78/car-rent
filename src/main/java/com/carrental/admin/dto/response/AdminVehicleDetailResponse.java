package com.carrental.admin.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AdminVehicleDetailResponse(
        Long vehicleId,
        String vehicleName,
        String vehicleNumber,
        String brand,
        String model,
        String vehicleType,
        Integer modelYear,
        Integer seatingCapacity,
        String fuelType,
        LocalDate registrationDate,
        BigDecimal ratePerKm,
        BigDecimal acRatePerKm,
        String location,
        String features,
        String approvalStatus,
        String operationalStatus,
        String rejectionReason,

        Long ownerId,
        String ownerName,
        String ownerEmail,
        String ownerMobileNumber,
        String ownerBusinessName,

        List<DocumentResponse> documents,
        List<ApprovalRecordResponse> approvalHistory,

        LocalDateTime createdAt
) {}


