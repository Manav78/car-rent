package com.carrental.customer.controller;

import com.carrental.auth.enums.Role;
import com.carrental.customer.dto.CustomerResponse;
import com.carrental.customer.dto.CustomerUpdateRequest;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerControllerTest {

    @Mock
    private CustomerService customerService;

    @InjectMocks
    private CustomerController customerController;

    private UserDetailsImpl userDetails;
    private CustomerResponse customerResponse;

    @BeforeEach
    void setUp() {
        userDetails = UserDetailsImpl.builder()
                .id(10L)
                .email("alice@example.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .build();

        customerResponse = CustomerResponse.builder()
                .id(10L)
                .firstName("Alice")
                .lastName("Smith")
                .fullName("Alice Smith")
                .email("alice@example.com")
                .phoneNumber("+1234567890")
                .role(Role.ROLE_CUSTOMER)
                .address("123 Main St")
                .city("Chicago")
                .postalCode("60601")
                .emailVerified(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should return customer dashboard response")
    void testGetCustomerDashboard() {
        var response = customerController.getCustomerDashboard();
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertTrue(response.getBody().getData().containsKey("message"));
    }

    @Test
    @DisplayName("Should return customer profile for authenticated customer")
    void testGetProfile() {
        when(customerService.getCustomerProfile(10L)).thenReturn(customerResponse);

        var response = customerController.getProfile(userDetails);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Alice Smith", response.getBody().getData().getFullName());
        assertEquals("Chicago", response.getBody().getData().getCity());
    }

    @Test
    @DisplayName("Should update customer profile via PUT")
    void testUpdateProfile() {
        CustomerUpdateRequest request = CustomerUpdateRequest.builder()
                .firstName("Alicia")
                .city("Springfield")
                .build();

        when(customerService.updateCustomerProfile(eq(10L), any(CustomerUpdateRequest.class)))
                .thenReturn(customerResponse);

        var response = customerController.updateProfile(userDetails, request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(customerService).updateCustomerProfile(10L, request);
    }

    @Test
    @DisplayName("Should update customer profile via PATCH")
    void testPatchProfile() {
        CustomerUpdateRequest request = CustomerUpdateRequest.builder()
                .address("New Address 100")
                .build();

        when(customerService.updateCustomerProfile(eq(10L), any(CustomerUpdateRequest.class)))
                .thenReturn(customerResponse);

        var response = customerController.patchProfile(userDetails, request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(customerService).updateCustomerProfile(10L, request);
    }
}
