package com.carrental.customer.controller;

import com.carrental.auth.enums.Role;
import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.service.BookingService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.customer.dto.response.CustomerResponse;
import com.carrental.customer.dto.request.CustomerUpdateRequest;
import com.carrental.customer.service.CustomerService;
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

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerController Unit Tests")
class CustomerControllerTest {

    @Mock
    private CustomerService customerService;

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private CustomerController customerController;

    private UserDetailsImpl userDetails;
    private CustomerResponse customerResponse;

    @BeforeEach
    void setUp() {
        userDetails = UserDetailsImpl.builder()
                .id(10L)
                .email("alice@example.com")
                .build();

        customerResponse = CustomerResponse.builder()
                .id(10L)
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@example.com")
                .role(Role.ROLE_CUSTOMER)
                .build();
    }

    @Test
    @DisplayName("Should return customer dashboard")
    void testGetCustomerDashboard() {
        ResponseEntity<ApiResponse<Map<String, String>>> response = customerController.getCustomerDashboard();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Should get profile for customer")
    void testGetProfile() {
        when(customerService.getCustomerProfile(10L)).thenReturn(customerResponse);

        ResponseEntity<ApiResponse<CustomerResponse>> response = customerController.getProfile(userDetails);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Alice", response.getBody().getData().getFirstName());
    }

    @Test
    @DisplayName("Should update profile for customer")
    void testUpdateProfile() {
        CustomerUpdateRequest request = new CustomerUpdateRequest();
        request.setFirstName("Alice Updated");

        when(customerService.updateCustomerProfile(eq(10L), any(CustomerUpdateRequest.class))).thenReturn(customerResponse);

        ResponseEntity<ApiResponse<CustomerResponse>> response = customerController.updateProfile(userDetails, request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(customerService).updateCustomerProfile(eq(10L), any(CustomerUpdateRequest.class));
    }

    @Test
    @DisplayName("Should delete own customer account")
    void testDeleteAccount() {
        doNothing().when(customerService).deleteCustomerAccount(10L);

        ResponseEntity<ApiResponse<Void>> response = customerController.deleteProfile(userDetails);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(customerService).deleteCustomerAccount(10L);
    }
}

