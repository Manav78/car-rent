package com.carrental.driver.controller;

import com.carrental.common.dto.ApiResponse;
import com.carrental.driver.dto.request.DriverRequest;
import com.carrental.driver.dto.response.DriverResponse;
import com.carrental.driver.dto.request.DriverStatusUpdateRequest;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.service.DriverService;
import com.carrental.security.service.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DriverControllerTest {

    @Mock
    private DriverService driverService;

    @InjectMocks
    private DriverController driverController;

    private UserDetailsImpl userDetails;
    private DriverResponse sampleResponse;

    @BeforeEach
    void setUp() {
        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .email("driver@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_DRIVER")))
                .build();

        sampleResponse = DriverResponse.builder()
                .id(10L)
                .userId(1L)
                .firstName("John")
                .lastName("Driver")
                .drivingLicenseNumber("DL-12345")
                .status(DriverStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("getDriverDashboard - returns dashboard message")
    void testGetDriverDashboard() {
        ResponseEntity<ApiResponse<Map<String, String>>> result = driverController.getDriverDashboard();

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getData()).containsKey("message");
    }

    @Test
    @DisplayName("getProfile - returns driver profile")
    void testGetProfile() {
        when(driverService.getDriverProfile(1L)).thenReturn(sampleResponse);

        ResponseEntity<ApiResponse<DriverResponse>> result = driverController.getProfile(userDetails);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getDrivingLicenseNumber()).isEqualTo("DL-12345");
    }

    @Test
    @DisplayName("updateProfile - returns updated profile")
    void testUpdateProfile() {
        DriverRequest request = DriverRequest.builder()
                .licenseNumber("DL-99999")
                .licenseExpiryDate(LocalDate.now().plusYears(2))
                .build();

        when(driverService.updateDriverProfile(eq(1L), any(DriverRequest.class))).thenReturn(sampleResponse);

        ResponseEntity<ApiResponse<DriverResponse>> result = driverController.updateProfile(userDetails, request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("updateStatus - returns updated status")
    void testUpdateStatus() {
        DriverStatusUpdateRequest request = new DriverStatusUpdateRequest();
        request.setStatus(DriverStatus.ON_TRIP);

        sampleResponse.setStatus(DriverStatus.ON_TRIP);
        when(driverService.updateStatus(eq(1L), any(DriverStatusUpdateRequest.class))).thenReturn(sampleResponse);

        ResponseEntity<ApiResponse<DriverResponse>> result = driverController.updateStatus(userDetails, request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getStatus()).isEqualTo(DriverStatus.ON_TRIP);
    }

    @Test
    @DisplayName("getAvailableDrivers - returns list of available drivers")
    void testGetAvailableDrivers() {
        when(driverService.getAvailableDrivers()).thenReturn(List.of(sampleResponse));

        ResponseEntity<ApiResponse<List<DriverResponse>>> result = driverController.getAvailableDrivers();

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData()).hasSize(1);
    }
}

