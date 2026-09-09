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

@Tag(name = "Owner Drivers", description = "Endpoints for managing drivers in owner fleet")
@RestController
@RequestMapping({ "/api/v1/owners/drivers", "/api/owners/drivers" })
@RequiredArgsConstructor
public class OwnerDriverController {

    private final DriverService driverService;

    @GetMapping("/available")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getAvailableDrivers() {
        List<DriverResponse> drivers = driverService.getAvailableDrivers();
        return ResponseEntity.ok(ApiResponse.success("Available drivers retrieved", drivers));
    }
}
