package com.carrental.admin.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PendingVehicleResponse(
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

        Long ownerProfileId,
        Long ownerUserId,
        String ownerFullName,
        String ownerEmail,
        String ownerMobileNumber,

        LocalDateTime submittedAt
) {}


