package com.carrental.admin.controller;

import com.carrental.admin.dto.request.*;
import com.carrental.admin.dto.response.*;
import com.carrental.admin.service.ApprovalService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.security.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Admin Approvals", description = "Admin approval workflows for vehicles, drivers, and owner-drivers")
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/approvals")
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping("/vehicles/pending")
    public ResponseEntity<ApiResponse<PageResponse<PendingVehicleResponse>>> getPendingVehicles(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(approvalService.getPendingVehicles(pageable)));
    }

    @GetMapping("/vehicles/{vehicleId}")
    public ResponseEntity<ApiResponse<AdminVehicleDetailResponse>> getVehicleDetail(
            @PathVariable Long vehicleId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(approvalService.getVehicleDetail(vehicleId)));
    }

    @PatchMapping("/vehicles/{vehicleId}")
    public ResponseEntity<ApiResponse<AdminVehicleDetailResponse>> decideVehicleApproval(
            @PathVariable Long vehicleId,
            @Valid @RequestBody ApprovalDecisionRequest request,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal
    ) {
        AdminVehicleDetailResponse response = approvalService.decideVehicleApproval(vehicleId, request, userPrincipal);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle approval decision recorded successfully", response));
    }

    @GetMapping("/drivers/pending")
    public ResponseEntity<ApiResponse<PageResponse<PendingDriverResponse>>> getPendingDrivers(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(approvalService.getPendingDrivers(pageable)));
    }

    @GetMapping("/drivers/{driverId}")
    public ResponseEntity<ApiResponse<AdminDriverDetailResponse>> getDriverDetail(
            @PathVariable Long driverId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(approvalService.getDriverDetail(driverId)));
    }

    @PatchMapping("/drivers/{driverId}")
    public ResponseEntity<ApiResponse<AdminDriverDetailResponse>> decideDriverApproval(
            @PathVariable Long driverId,
            @Valid @RequestBody ApprovalDecisionRequest request,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal
    ) {
        AdminDriverDetailResponse response = approvalService.decideDriverApproval(driverId, request, userPrincipal);
        return ResponseEntity.ok(ApiResponse.ok("Driver approval decision recorded successfully", response));
    }

    @GetMapping("/owner-drivers/pending")
    public ResponseEntity<ApiResponse<PageResponse<PendingOwnerDriverResponse>>> getPendingOwnerDrivers(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(approvalService.getPendingOwnerDrivers(pageable)));
    }

    @GetMapping("/owner-drivers/{id}")
    public ResponseEntity<ApiResponse<AdminOwnerDriverDetailResponse>> getOwnerDriverDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(approvalService.getOwnerDriverDetail(id)));
    }

    @PatchMapping("/owner-drivers/{id}")
    public ResponseEntity<ApiResponse<AdminOwnerDriverDetailResponse>> decideOwnerDriverApproval(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalDecisionRequest request,
            @AuthenticationPrincipal UserDetailsImpl principal
    ) {
        AdminOwnerDriverDetailResponse response = approvalService.decideOwnerDriverApproval(id, request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Owner-driver approval decision recorded successfully", response));
    }
}

