package com.carrental.admin.controller;

import com.carrental.admin.dto.response.AdminDriverDetailResponse;
import com.carrental.admin.dto.response.AdminOwnerDriverDetailResponse;
import com.carrental.admin.dto.response.AdminVehicleDetailResponse;
import com.carrental.admin.dto.request.ApprovalDecisionRequest;
import com.carrental.admin.dto.response.PageResponse;
import com.carrental.admin.dto.response.PendingDriverResponse;
import com.carrental.admin.dto.response.PendingOwnerDriverResponse;
import com.carrental.admin.dto.response.PendingVehicleResponse;
import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.admin.service.ApprovalService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.security.service.UserDetailsImpl;
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

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApprovalControllerTest {

    @Mock
    private ApprovalService approvalService;

    @InjectMocks
    private ApprovalController approvalController;

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
    @DisplayName("getPendingVehicles - returns page")
    void testGetPendingVehicles() {
        Pageable pageable = PageRequest.of(0, 20);
        PageResponse<PendingVehicleResponse> page = PageResponse.from(new org.springframework.data.domain.PageImpl<>(Collections.emptyList(), pageable, 0));
        when(approvalService.getPendingVehicles(pageable)).thenReturn(page);

        ResponseEntity<ApiResponse<PageResponse<PendingVehicleResponse>>> result = approvalController.getPendingVehicles(pageable);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("getVehicleDetail - returns detail")
    void testGetVehicleDetail() {
        AdminVehicleDetailResponse detail = new AdminVehicleDetailResponse(1L, "Honda Civic", "XYZ-123", "Honda", "Civic", "SEDAN", 2022, 4, "PETROL", null, null, null, null, null, "PENDING", "INACTIVE", null, null, null, null, null, null, null, null, null);
        when(approvalService.getVehicleDetail(1L)).thenReturn(detail);

        ResponseEntity<ApiResponse<AdminVehicleDetailResponse>> result = approvalController.getVehicleDetail(1L);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().brand()).isEqualTo("Honda");
    }

    @Test
    @DisplayName("decideVehicleApproval - records decision and returns detail")
    void testDecideVehicleApproval() {
        ApprovalDecisionRequest request = new ApprovalDecisionRequest(ApprovalDecision.REJECTED, "Invalid documents");
        AdminVehicleDetailResponse detail = new AdminVehicleDetailResponse(1L, "Honda Civic", "XYZ-123", "Honda", "Civic", "SEDAN", 2022, 4, "PETROL", null, null, null, null, null, "REJECTED", "INACTIVE", "Invalid documents", null, null, null, null, null, null, null, null);
        when(approvalService.decideVehicleApproval(1L, request, userPrincipal)).thenReturn(detail);

        ResponseEntity<ApiResponse<AdminVehicleDetailResponse>> result = approvalController.decideVehicleApproval(1L, request, userPrincipal);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().rejectionReason()).isEqualTo("Invalid documents");
        assertThat(result.getBody().getData().approvalStatus()).isEqualTo("REJECTED");
        verify(approvalService).decideVehicleApproval(1L, request, userPrincipal);
    }

    @Test
    @DisplayName("getPendingDrivers - returns page")
    void testGetPendingDrivers() {
        Pageable pageable = PageRequest.of(0, 20);
        PageResponse<PendingDriverResponse> page = PageResponse.from(new org.springframework.data.domain.PageImpl<>(Collections.emptyList(), pageable, 0));
        when(approvalService.getPendingDrivers(pageable)).thenReturn(page);

        ResponseEntity<ApiResponse<PageResponse<PendingDriverResponse>>> result = approvalController.getPendingDrivers(pageable);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("getDriverDetail - returns detail")
    void testGetDriverDetail() {
        AdminDriverDetailResponse detail = new AdminDriverDetailResponse(2L, 10L, "Driver Name", "driver@test.com", "12345", null, "DL123", null, "PENDING", "INACTIVE", null, null, null, null, null, null, null);
        when(approvalService.getDriverDetail(2L)).thenReturn(detail);

        ResponseEntity<ApiResponse<AdminDriverDetailResponse>> result = approvalController.getDriverDetail(2L);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("decideDriverApproval - records decision and returns detail")
    void testDecideDriverApproval() {
        ApprovalDecisionRequest request = new ApprovalDecisionRequest(ApprovalDecision.REJECTED, "Expired license");
        AdminDriverDetailResponse detail = new AdminDriverDetailResponse(2L, 10L, "Driver Name", "driver@test.com", "12345", null, "DL123", null, "REJECTED", "INACTIVE", "Expired license", null, null, null, null, null, null);
        when(approvalService.decideDriverApproval(2L, request, userPrincipal)).thenReturn(detail);

        ResponseEntity<ApiResponse<AdminDriverDetailResponse>> result = approvalController.decideDriverApproval(2L, request, userPrincipal);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().rejectionReason()).isEqualTo("Expired license");
        assertThat(result.getBody().getData().approvalStatus()).isEqualTo("REJECTED");
        verify(approvalService).decideDriverApproval(2L, request, userPrincipal);
    }

    @Test
    @DisplayName("getPendingOwnerDrivers - returns page")
    void testGetPendingOwnerDrivers() {
        Pageable pageable = PageRequest.of(0, 20);
        PageResponse<PendingOwnerDriverResponse> page = PageResponse.from(new org.springframework.data.domain.PageImpl<>(Collections.emptyList(), pageable, 0));
        when(approvalService.getPendingOwnerDrivers(pageable)).thenReturn(page);

        ResponseEntity<ApiResponse<PageResponse<PendingOwnerDriverResponse>>> result = approvalController.getPendingOwnerDrivers(pageable);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("getOwnerDriverDetail - returns detail")
    void testGetOwnerDriverDetail() {
        AdminOwnerDriverDetailResponse detail = new AdminOwnerDriverDetailResponse(3L, 10L, "Owner Driver", "od@test.com", "12345", "Fleet", "DL123", null, "PENDING", null, null, null, null);
        when(approvalService.getOwnerDriverDetail(3L)).thenReturn(detail);

        ResponseEntity<ApiResponse<AdminOwnerDriverDetailResponse>> result = approvalController.getOwnerDriverDetail(3L);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("decideOwnerDriverApproval - records decision and returns detail")
    void testDecideOwnerDriverApproval() {
        ApprovalDecisionRequest request = new ApprovalDecisionRequest(ApprovalDecision.REJECTED, "Invalid license");
        AdminOwnerDriverDetailResponse detail = new AdminOwnerDriverDetailResponse(3L, 10L, "Owner Driver", "od@test.com", "12345", "Fleet", "DL123", null, "REJECTED", "Invalid license", null, null, null);
        when(approvalService.decideOwnerDriverApproval(3L, request, userPrincipal)).thenReturn(detail);

        ResponseEntity<ApiResponse<AdminOwnerDriverDetailResponse>> result = approvalController.decideOwnerDriverApproval(3L, request, userPrincipal);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().rejectionReason()).isEqualTo("Invalid license");
        assertThat(result.getBody().getData().approvalStatus()).isEqualTo("REJECTED");
        verify(approvalService).decideOwnerDriverApproval(3L, request, userPrincipal);
    }
}

