package com.carrental.vehicle.service.impl;

import com.carrental.vehicle.service.VehicleService;

import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.auth.entity.User;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.BadRequestException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.vehicle.dto.request.VehicleRequest;
import com.carrental.vehicle.dto.response.VehicleResponse;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.enums.VehicleType;
import com.carrental.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public VehicleResponse createVehicle(Long ownerId, VehicleRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner", "id", ownerId));

        if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new BadRequestException("Vehicle with license plate already exists: " + request.getLicensePlate());
        }

        Vehicle vehicle = Vehicle.builder()
                .owner(owner)
                .brand(request.getBrand())
                .model(request.getModel())
                .year(request.getYear())
                .licensePlate(request.getLicensePlate())
                .pricePerKm(request.getPricePerKm())
                .seatingCapacity(request.getSeatingCapacity())
                .vehicleType(request.getVehicleType())
                .fuelType(request.getFuelType())
                .status(VehicleStatus.INACTIVE)
                .approvalStatus(ApprovalDecision.PENDING)
                .location(request.getLocation())
                .imageUrls(request.getImageUrls() != null ? new ArrayList<>(request.getImageUrls()) : new ArrayList<>())
                .description(request.getDescription())
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Registered new vehicle: {} {} [{}] by owner: {}", saved.getBrand(), saved.getModel(), saved.getLicensePlate(), owner.getEmail());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
        return mapToResponse(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> getVehiclesByOwner(Long ownerId) {
        return vehicleRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> getAllAvailableVehicles(String city, VehicleType vehicleType, Integer seatingCapacity) {
        return vehicleRepository.searchAvailableVehicles(city, vehicleType, seatingCapacity)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public VehicleResponse updateVehicle(Long ownerId, Long vehicleId, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        if (!vehicle.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You do not have permission to update this vehicle");
        }

        if (!vehicle.getLicensePlate().equals(request.getLicensePlate()) &&
                vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new BadRequestException("Vehicle with license plate already exists: " + request.getLicensePlate());
        }

        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setPricePerKm(request.getPricePerKm());
        vehicle.setSeatingCapacity(request.getSeatingCapacity());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setFuelType(request.getFuelType());
        if (request.getStatus() != null && vehicle.getApprovalStatus() == ApprovalDecision.APPROVED) {
            if (vehicle.getStatus() == VehicleStatus.BOOKED || vehicle.getStatus() == VehicleStatus.ON_TRIP) {
                throw new BadRequestException("Cannot change status of a vehicle that is currently " + vehicle.getStatus());
            }
            if (request.getStatus() == VehicleStatus.AVAILABLE || request.getStatus() == VehicleStatus.MAINTENANCE || request.getStatus() == VehicleStatus.INACTIVE) {
                vehicle.setStatus(request.getStatus());
            } else {
                throw new BadRequestException("Invalid status transition for vehicle: " + request.getStatus());
            }
        }
        vehicle.setLocation(request.getLocation());
        if (request.getImageUrls() != null) {
            vehicle.setImageUrls(new ArrayList<>(request.getImageUrls()));
        }
        vehicle.setDescription(request.getDescription());

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Updated vehicle id: {}", vehicleId);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long ownerId, Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        if (!vehicle.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You do not have permission to delete this vehicle");
        }

        vehicleRepository.delete(vehicle);
        log.info("Deleted vehicle id: {}", vehicleId);
    }

    private VehicleResponse mapToResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .licensePlate(vehicle.getLicensePlate())
                .pricePerKm(vehicle.getPricePerKm())
                .seatingCapacity(vehicle.getSeatingCapacity())
                .vehicleType(vehicle.getVehicleType())
                .fuelType(vehicle.getFuelType())
                .status(vehicle.getStatus())
                .approvalStatus(vehicle.getApprovalStatus())
                .location(vehicle.getLocation())
                .imageUrls(vehicle.getImageUrls() != null ? new ArrayList<>(vehicle.getImageUrls()) : new ArrayList<>())
                .description(vehicle.getDescription())
                .createdAt(vehicle.getCreatedAt())
                .build();
    }
}

