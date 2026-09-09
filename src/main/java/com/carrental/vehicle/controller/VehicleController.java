package com.carrental.vehicle.controller;

import com.carrental.common.dto.ApiResponse;
import com.carrental.security.service.UserDetailsImpl;
import com.carrental.vehicle.dto.request.VehicleRequest;
import com.carrental.vehicle.dto.response.VehicleResponse;
import com.carrental.vehicle.enums.VehicleType;
import com.carrental.vehicle.service.VehicleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Vehicles", description = "Endpoints for vehicle discovery, search, filtering, and fleet management")
@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAllAvailableVehicles(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "vehicleType", required = false) VehicleType vehicleType,
            @RequestParam(value = "seatingCapacity", required = false) Integer seatingCapacity) {
        List<VehicleResponse> vehicles = vehicleService.getAllAvailableVehicles(city, vehicleType, seatingCapacity);
        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved successfully", vehicles));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> searchVehicles(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "vehicleType", required = false) VehicleType vehicleType,
            @RequestParam(value = "seatingCapacity", required = false) Integer seatingCapacity) {
        List<VehicleResponse> vehicles = vehicleService.getAllAvailableVehicles(city, vehicleType, seatingCapacity);
        return ResponseEntity.ok(ApiResponse.success("Vehicles search completed", vehicles));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable("id") Long id) {
        VehicleResponse response = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle retrieved successfully", response));
    }

    @GetMapping("/my-vehicles")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getMyVehicles(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<VehicleResponse> vehicles = vehicleService.getVehiclesByOwner(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Owner vehicles retrieved", vehicles));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                      @Valid @RequestBody VehicleRequest request) {
        VehicleResponse response = vehicleService.createVehicle(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Vehicle listed successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                      @PathVariable("id") Long id,
                                                                      @Valid @RequestBody VehicleRequest request) {
        VehicleResponse response = vehicleService.updateVehicle(userDetails.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                           @PathVariable("id") Long id) {
        vehicleService.deleteVehicle(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully"));
    }
}

