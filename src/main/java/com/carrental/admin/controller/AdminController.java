package com.carrental.admin.controller;

import com.carrental.admin.dto.request.*;
import com.carrental.admin.dto.response.*;
import com.carrental.admin.service.AdminService;
import com.carrental.auth.dto.response.UserResponse;
import com.carrental.common.dto.ApiResponse;
import com.carrental.driver.dto.response.DriverResponse;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.owner.dto.response.OwnerResponse;
import com.carrental.owner.enums.OwnerStatus;
import com.carrental.security.service.UserDetailsImpl;
import com.carrental.vehicle.dto.response.VehicleResponse;
import com.carrental.vehicle.enums.VehicleStatus;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Admin", description = "Admin platform management, profile, dashboard, and summaries")
@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AdminProfileResponse>> me(@AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAdminProfile(userPrincipal)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAdminDashboardStats()));
    }

    @GetMapping("/owners")
    public ResponseEntity<ApiResponse<PageResponse<OwnerSummaryResponse>>> getOwners(
            @PageableDefault(size = 20, sort = "id") Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getOwners(pageable)));
    }

    @GetMapping("/drivers")
    public ResponseEntity<ApiResponse<PageResponse<DriverSummaryResponse>>> getDrivers(
            @PageableDefault(size = 20, sort = "id") Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getDrivers(pageable)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getDashboardStats() {
        AdminDashboardStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Admin stats retrieved successfully", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("All users retrieved successfully", users));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody AdminUserStatusUpdateRequest request
    ) {
        UserResponse response = adminService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", response));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable("id") Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    @PatchMapping("/owners/{id}/status")
    public ResponseEntity<ApiResponse<OwnerResponse>> updateOwnerStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") OwnerStatus status,
            @RequestParam(value = "reason", required = false) String reason
    ) {
        OwnerResponse response = reason != null
                ? adminService.updateOwnerStatus(id, status, reason)
                : adminService.updateOwnerStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Owner status updated successfully", response));
    }

    @PatchMapping("/drivers/{id}/status")
    public ResponseEntity<ApiResponse<DriverResponse>> updateDriverStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") DriverStatus status,
            @RequestParam(value = "reason", required = false) String reason
    ) {
        DriverResponse response = reason != null
                ? adminService.updateDriverStatus(id, status, reason)
                : adminService.updateDriverStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Driver status updated successfully", response));
    }

    @PatchMapping("/vehicles/{id}/status")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicleStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") VehicleStatus status,
            @RequestParam(value = "reason", required = false) String reason
    ) {
        VehicleResponse response = reason != null
                ? adminService.updateVehicleStatus(id, status, reason)
                : adminService.updateVehicleStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Vehicle status updated successfully", response));
    }

    public ResponseEntity<ApiResponse<OwnerResponse>> updateOwnerStatus(Long id, OwnerStatus status) {
        return updateOwnerStatus(id, status, null);
    }

    public ResponseEntity<ApiResponse<DriverResponse>> updateDriverStatus(Long id, DriverStatus status) {
        return updateDriverStatus(id, status, null);
    }

    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicleStatus(Long id, VehicleStatus status) {
        return updateVehicleStatus(id, status, null);
    }
}

