package com.carrental.admin.dto.response;

public record VehicleMonitoringResponse(
        Long vehicleId,
        String brand,
        String model,
        String vehicleName,
        String vehicleType,
        String vehicleNumber,
        String ownerName,
        String ownerEmail,
        String approvalStatus,
        String operationalStatus
) {}


