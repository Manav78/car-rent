package com.carrental.vehicle.service;

import com.carrental.vehicle.dto.VehicleRequest;
import com.carrental.vehicle.dto.VehicleResponse;
import com.carrental.vehicle.enums.VehicleType;

import java.util.List;

public interface VehicleService {

    VehicleResponse createVehicle(Long ownerId, VehicleRequest request);

    VehicleResponse getVehicleById(Long id);

    List<VehicleResponse> getVehiclesByOwner(Long ownerId);

    List<VehicleResponse> getAllAvailableVehicles(String city, VehicleType vehicleType, Integer seatingCapacity);

    VehicleResponse updateVehicle(Long ownerId, Long vehicleId, VehicleRequest request);

    void deleteVehicle(Long ownerId, Long vehicleId);
}
