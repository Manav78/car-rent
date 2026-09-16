package com.carrental.vehicle.dto.response;

import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.vehicle.enums.FuelType;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.enums.VehicleType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VehicleResponse {
    private Long id;
    private String brand;
    private String model;
    private Integer year;
    private String licensePlate;
    private Integer pricePerKm;
    private Integer seatingCapacity;
    private VehicleType vehicleType;
    private FuelType fuelType;
    private VehicleStatus status;
    private ApprovalDecision approvalStatus;
    private String location;
    private List<String> imageUrls;
    private String description;
    private LocalDateTime createdAt;
}
