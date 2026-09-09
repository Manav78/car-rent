package com.carrental.admin.controller;

import com.carrental.admin.dto.response.PageResponse;
import com.carrental.admin.dto.response.VehicleMonitoringResponse;
import com.carrental.admin.service.AdminMonitoringService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.vehicle.enums.VehicleStatus;
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

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminMonitoringControllerTest {

    @Mock
    private AdminMonitoringService adminMonitoringService;

    @InjectMocks
    private AdminMonitoringController adminMonitoringController;

    @Test
    @DisplayName("getVehicles - returns vehicle monitoring page")
    void testGetVehicles() {
        Pageable pageable = PageRequest.of(0, 20);
        PageResponse<VehicleMonitoringResponse> page = PageResponse.from(new org.springframework.data.domain.PageImpl<>(Collections.emptyList(), pageable, 0));
        when(adminMonitoringService.getVehicleMonitoring(eq("Tesla"), eq("ACTIVE"), eq(VehicleStatus.AVAILABLE), eq(pageable)))
                .thenReturn(page);

        ResponseEntity<ApiResponse<PageResponse<VehicleMonitoringResponse>>> result =
                adminMonitoringController.getVehicles("Tesla", "ACTIVE", VehicleStatus.AVAILABLE, pageable);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}

