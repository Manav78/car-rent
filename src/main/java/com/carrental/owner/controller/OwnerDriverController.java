package com.carrental.owner.controller;

import com.carrental.common.dto.ApiResponse;
import com.carrental.driver.dto.response.DriverResponse;
import com.carrental.driver.service.DriverService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.carrental.driver.dto.request.CreateDriverRequest;
import com.carrental.security.service.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Owner Drivers", description = "Endpoints for managing drivers in owner fleet")
@RestController
@RequestMapping("/api/owners/drivers")
@RequiredArgsConstructor
public class OwnerDriverController {

    private final DriverService driverService;

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<DriverResponse>> createDriver(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CreateDriverRequest request) {
        DriverResponse response = driverService.createDriverForOwner(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Driver created successfully and pending admin approval", response));
    }

    @GetMapping("/available")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getAvailableDrivers(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<DriverResponse> drivers = driverService.getAvailableDrivers(userDetails != null ? userDetails.getId() : null);
        return ResponseEntity.ok(ApiResponse.success("Available drivers retrieved", drivers));
    }
}
