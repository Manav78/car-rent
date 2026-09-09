package com.carrental.owner.controller;

import com.carrental.common.dto.ApiResponse;
import com.carrental.owner.dto.response.OwnerResponse;
import com.carrental.owner.dto.request.OwnerUpdateRequest;
import com.carrental.owner.service.OwnerService;
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

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OwnerController Unit Tests")
class OwnerControllerTest {

    @Mock
    private OwnerService ownerService;

    @InjectMocks
    private OwnerController ownerController;

    private UserDetailsImpl userDetails;
    private OwnerResponse ownerResponse;

    @BeforeEach
    void setUp() {
        userDetails = UserDetailsImpl.builder()
                .id(20L)
                .email("owner@example.com")
                .build();

        ownerResponse = OwnerResponse.builder()
                .id(20L)
                .firstName("Bob")
                .lastName("Owner")
                .email("owner@example.com")
                .build();
    }

    @Test
    @DisplayName("Should return owner dashboard")
    void testGetOwnerDashboard() {
        ResponseEntity<ApiResponse<Map<String, String>>> response = ownerController.getOwnerDashboard();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Should return owner profile")
    void testGetProfile() {
        when(ownerService.getOwnerProfile(20L)).thenReturn(ownerResponse);

        ResponseEntity<ApiResponse<OwnerResponse>> response = ownerController.getProfile(userDetails);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Bob", response.getBody().getData().getFirstName());
    }

    @Test
    @DisplayName("Should update owner profile")
    void testUpdateProfile() {
        OwnerUpdateRequest request = new OwnerUpdateRequest();
        request.setFirstName("Bob Updated");

        when(ownerService.updateOwnerProfile(eq(20L), any(OwnerUpdateRequest.class))).thenReturn(ownerResponse);

        ResponseEntity<ApiResponse<OwnerResponse>> response = ownerController.updateProfile(userDetails, request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(ownerService).updateOwnerProfile(eq(20L), any(OwnerUpdateRequest.class));
    }
}

