package com.carrental.admin.controller;

import com.carrental.admin.dto.response.PageResponse;
import com.carrental.admin.dto.response.VehicleMonitoringResponse;
import com.carrental.admin.service.AdminMonitoringService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.vehicle.enums.VehicleStatus;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin Monitoring", description = "Fleet and vehicle monitoring across platform")
@RestController
@RequestMapping({"/api/v1/admin/monitoring", "/api/admin/monitoring"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMonitoringController {

    private final AdminMonitoringService adminMonitoringService;

    @GetMapping("/vehicles")
    public ResponseEntity<ApiResponse<PageResponse<VehicleMonitoringResponse>>> getVehicles(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String operationalStatus,
            @RequestParam(required = false) VehicleStatus approvalStatus,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        PageResponse<VehicleMonitoringResponse> response = adminMonitoringService.getVehicleMonitoring(
                search,
                operationalStatus,
                approvalStatus,
                pageable
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}

