package com.carrental.vehicle.dto;

import com.carrental.vehicle.enums.FuelType;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.enums.VehicleType;
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
public class VehicleResponse {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private String brand;
    private String model;
    private Integer year;
    private String licensePlate;
    private Integer pricePerKm;
    private Integer seatingCapacity;
    private VehicleType vehicleType;
    private FuelType fuelType;
    private VehicleStatus status;
    private String location;
    private List<String> imageUrls;
    private String description;
    private LocalDateTime createdAt;
}
