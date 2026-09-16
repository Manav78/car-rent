package com.carrental.admin.controller;

import com.carrental.admin.dto.response.AdminDashboardResponse;
import com.carrental.admin.dto.response.AdminDashboardStatsResponse;
import com.carrental.admin.dto.response.AdminProfileResponse;
import com.carrental.admin.dto.request.AdminUserStatusUpdateRequest;
import com.carrental.admin.dto.response.DriverSummaryResponse;
import com.carrental.admin.dto.response.OwnerSummaryResponse;
import com.carrental.admin.dto.response.PageResponse;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private AdminService adminService;

    @InjectMocks
    private AdminController adminController;

    private UserDetailsImpl userPrincipal;

    @BeforeEach
    void setUp() {
        userPrincipal = UserDetailsImpl.builder()
                .id(1L)
                .email("admin@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();
    }

    @Test
    @DisplayName("me - returns admin profile")
    void testMe() {
        AdminProfileResponse profile = new AdminProfileResponse(1L, "Admin User", "admin@test.com", "1234567890", List.of("ROLE_ADMIN"), LocalDateTime.now());
        when(adminService.getAdminProfile(userPrincipal)).thenReturn(profile);

        ResponseEntity<ApiResponse<AdminProfileResponse>> result = adminController.me(userPrincipal);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getData().email()).isEqualTo("admin@test.com");
    }

    @Test
    @DisplayName("getAdminDashboard - returns stats")
    void testGetAdminDashboard() {
        AdminDashboardResponse dashboard = new AdminDashboardResponse(5, 20, 8, 15, 2, 1, 1, 4, 10, 2, 0);
        when(adminService.getAdminDashboardStats()).thenReturn(dashboard);

        ResponseEntity<ApiResponse<AdminDashboardResponse>> result = adminController.getAdminDashboard();

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().totalOwners()).isEqualTo(5);
    }

    @Test
    @DisplayName("getOwners - returns owners page")
    void testGetOwners() {
        Pageable pageable = PageRequest.of(0, 20);
        PageResponse<OwnerSummaryResponse> pageResp = PageResponse.from(new org.springframework.data.domain.PageImpl<>(Collections.emptyList(), pageable, 0));
        when(adminService.getOwners(pageable)).thenReturn(pageResp);

        ResponseEntity<ApiResponse<PageResponse<OwnerSummaryResponse>>> result = adminController.getOwners(pageable);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("getDrivers - returns drivers page")
    void testGetDrivers() {
        Pageable pageable = PageRequest.of(0, 20);
        PageResponse<DriverSummaryResponse> pageResp = PageResponse.from(new org.springframework.data.domain.PageImpl<>(Collections.emptyList(), pageable, 0));
        when(adminService.getDrivers(pageable)).thenReturn(pageResp);

        ResponseEntity<ApiResponse<PageResponse<DriverSummaryResponse>>> result = adminController.getDrivers(pageable);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("getDashboardStats - returns stats")
    void testGetDashboardStats() {
        AdminDashboardStatsResponse stats = AdminDashboardStatsResponse.builder().totalUsers(10L).build();
        when(adminService.getDashboardStats()).thenReturn(stats);

        ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> result = adminController.getDashboardStats();

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getTotalUsers()).isEqualTo(10L);
    }

    @Test
    @DisplayName("getAllUsers - returns user list")
    void testGetAllUsers() {
        when(adminService.getAllUsers()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<UserResponse>>> result = adminController.getAllUsers();

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("updateUserStatus - returns updated user")
    void testUpdateUserStatus() {
        AdminUserStatusUpdateRequest request = new AdminUserStatusUpdateRequest(true, true);
        UserResponse response = UserResponse.builder().id(2L).enabled(true).build();
        when(adminService.updateUserStatus(eq(2L), any())).thenReturn(response);

        ResponseEntity<ApiResponse<UserResponse>> result = adminController.updateUserStatus(2L, request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().isEnabled()).isTrue();
    }

    @Test
    @DisplayName("deleteUser - returns success")
    void testDeleteUser() {
        ResponseEntity<ApiResponse<Void>> result = adminController.deleteUser(2L);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(adminService).deleteUser(2L);
    }

    @Test
    @DisplayName("updateOwnerStatus - returns updated owner")
    void testUpdateOwnerStatus() {
        OwnerResponse response = OwnerResponse.builder().id(5L).status(OwnerStatus.APPROVED).build();
        when(adminService.updateOwnerStatus(5L, OwnerStatus.APPROVED)).thenReturn(response);

        ResponseEntity<ApiResponse<OwnerResponse>> result = adminController.updateOwnerStatus(5L, OwnerStatus.APPROVED);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getStatus()).isEqualTo(OwnerStatus.APPROVED);
    }

    @Test
    @DisplayName("updateDriverStatus - returns updated driver")
    void testUpdateDriverStatus() {
        DriverResponse response = DriverResponse.builder().id(6L).status(DriverStatus.ACTIVE).build();
        when(adminService.updateDriverStatus(6L, DriverStatus.ACTIVE)).thenReturn(response);

        ResponseEntity<ApiResponse<DriverResponse>> result = adminController.updateDriverStatus(6L, DriverStatus.ACTIVE);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getStatus()).isEqualTo(DriverStatus.ACTIVE);
    }

    @Test
    @DisplayName("updateVehicleStatus - returns updated vehicle")
    void testUpdateVehicleStatus() {
        VehicleResponse response = VehicleResponse.builder().id(7L).status(VehicleStatus.AVAILABLE).build();
        when(adminService.updateVehicleStatus(7L, VehicleStatus.AVAILABLE)).thenReturn(response);

        ResponseEntity<ApiResponse<VehicleResponse>> result = adminController.updateVehicleStatus(7L, VehicleStatus.AVAILABLE);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getStatus()).isEqualTo(VehicleStatus.AVAILABLE);
    }
}

