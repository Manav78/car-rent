package com.carrental.driver.controller;

import com.carrental.common.dto.ApiResponse;
import com.carrental.driver.dto.request.DriverRequest;
import com.carrental.driver.dto.response.DriverResponse;
import com.carrental.driver.dto.request.DriverStatusUpdateRequest;
import com.carrental.driver.service.DriverService;
import com.carrental.security.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(name = "Driver", description = "Endpoints for driver profile, status, and ride operations")
@RestController
@RequestMapping({"/api/drivers", "/api/v1/drivers"})
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDriverDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Driver dashboard accessed successfully",
                Map.of("message", "Welcome Driver! You can view assigned trips and update availability.")));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<DriverResponse>> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        DriverResponse response = driverService.getDriverProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Driver profile retrieved", response));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<DriverResponse>> updateProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                     @Valid @RequestBody DriverRequest request) {
        DriverResponse response = driverService.updateDriverProfile(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Driver profile updated successfully", response));
    }

    @PatchMapping("/status")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<DriverResponse>> updateStatus(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                    @Valid @RequestBody DriverStatusUpdateRequest request) {
        DriverResponse response = driverService.updateStatus(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Driver status updated", response));
    }

    @GetMapping("/available")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getAvailableDrivers(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long ownerId = (userDetails != null && userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_OWNER")))
                ? userDetails.getId()
                : null;
        List<DriverResponse> drivers = driverService.getAvailableDrivers(ownerId);
        return ResponseEntity.ok(ApiResponse.success("Available drivers retrieved", drivers));
    }

    public ResponseEntity<ApiResponse<List<DriverResponse>>> getAvailableDrivers() {
        List<DriverResponse> drivers = driverService.getAvailableDrivers();
        return ResponseEntity.ok(ApiResponse.success("Available drivers retrieved", drivers));
    }
}

