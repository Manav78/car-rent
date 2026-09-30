package com.carrental.owner.controller;

import com.carrental.common.dto.ApiResponse;
import com.carrental.security.service.UserDetailsImpl;
import com.carrental.vehicle.dto.request.VehicleRequest;
import com.carrental.vehicle.dto.response.VehicleResponse;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Owner Vehicles", description = "Endpoints for owner fleet management")
@RestController
@RequestMapping("/api/owners/vehicles")
@RequiredArgsConstructor
public class OwnerVehicleController {

    private final VehicleService vehicleService;

    @GetMapping
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
