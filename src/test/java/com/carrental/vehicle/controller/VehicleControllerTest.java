package com.carrental.vehicle.controller;

import com.carrental.common.dto.ApiResponse;
import com.carrental.security.service.UserDetailsImpl;
import com.carrental.vehicle.dto.request.VehicleRequest;
import com.carrental.vehicle.dto.response.VehicleResponse;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.enums.VehicleType;
import com.carrental.vehicle.service.VehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VehicleController Unit Tests")
class VehicleControllerTest {

    @Mock
    private VehicleService vehicleService;

    @InjectMocks
    private VehicleController vehicleController;

    private UserDetailsImpl ownerPrincipal;
    private VehicleResponse sampleResponse;

    @BeforeEach
    void setUp() {
        ownerPrincipal = UserDetailsImpl.builder()
                .id(20L)
                .email("owner@example.com")
                .build();

        sampleResponse = VehicleResponse.builder()
                .id(100L)
                .brand("Honda")
                .model("City")
                .licensePlate("MH12AB1234")
                .status(VehicleStatus.AVAILABLE)
                .build();
    }

    @Test
    @DisplayName("Should retrieve available vehicles")
    void testGetAllAvailableVehicles() {
        when(vehicleService.getAllAvailableVehicles("Pune", VehicleType.SEDAN, 5))
                .thenReturn(List.of(sampleResponse));

        ResponseEntity<ApiResponse<List<VehicleResponse>>> response =
                vehicleController.getAllAvailableVehicles("Pune", VehicleType.SEDAN, 5);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    @DisplayName("Should get vehicle by ID")
    void testGetVehicleById() {
        when(vehicleService.getVehicleById(100L)).thenReturn(sampleResponse);

        ResponseEntity<ApiResponse<VehicleResponse>> response = vehicleController.getVehicleById(100L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Honda", response.getBody().getData().getBrand());
    }

    @Test
    @DisplayName("Should get vehicles of logged-in owner")
    void testGetMyVehicles() {
        when(vehicleService.getVehiclesByOwner(20L)).thenReturn(List.of(sampleResponse));

        ResponseEntity<ApiResponse<List<VehicleResponse>>> response = vehicleController.getMyVehicles(ownerPrincipal);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    @DisplayName("Should create vehicle")
    void testCreateVehicle() {
        VehicleRequest request = new VehicleRequest();
        when(vehicleService.createVehicle(eq(20L), any(VehicleRequest.class))).thenReturn(sampleResponse);

        ResponseEntity<ApiResponse<VehicleResponse>> response = vehicleController.createVehicle(ownerPrincipal, request);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(vehicleService).createVehicle(eq(20L), any(VehicleRequest.class));
    }

    @Test
    @DisplayName("Should delete vehicle")
    void testDeleteVehicle() {
        doNothing().when(vehicleService).deleteVehicle(20L, 100L);

        ResponseEntity<ApiResponse<Void>> response = vehicleController.deleteVehicle(ownerPrincipal, 100L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(vehicleService).deleteVehicle(20L, 100L);
    }
}

