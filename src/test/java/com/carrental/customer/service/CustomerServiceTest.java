package com.carrental.customer.service;

import com.carrental.customer.service.impl.CustomerServiceImpl;

import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.customer.dto.response.CustomerResponse;
import com.carrental.customer.dto.request.CustomerUpdateRequest;
import com.carrental.customer.entity.CustomerProfile;
import com.carrental.customer.mapper.CustomerMapper;
import com.carrental.customer.repository.CustomerProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerService Unit Tests")
class CustomerServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CustomerProfileRepository customerProfileRepository;

    @Mock
    private CustomerMapper customerMapper;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private User sampleUser;
    private CustomerProfile sampleProfile;
    private CustomerResponse sampleResponse;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(10L)
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@example.com")
                .phoneNumber("+1234567890")
                .role(Role.ROLE_CUSTOMER)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        sampleProfile = CustomerProfile.builder()
                .id(100L)
                .user(sampleUser)
                .address("123 Main St")
                .city("Chicago")
                .postalCode("60601")
                .build();

        sampleResponse = CustomerResponse.builder()
                .id(10L)
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@example.com")
                .address("123 Main St")
                .city("Chicago")
                .postalCode("60601")
                .build();
    }

    @Test
    @DisplayName("Should retrieve customer profile")
    void testGetCustomerProfileSuccess() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(customerProfileRepository.findByUserId(10L)).thenReturn(Optional.of(sampleProfile));
        when(customerMapper.toResponse(sampleUser, sampleProfile)).thenReturn(sampleResponse);

        CustomerResponse result = customerService.getCustomerProfile(10L);

        assertNotNull(result);
        assertEquals("Alice", result.getFirstName());
        assertEquals("Chicago", result.getCity());
    }

    @Test
    @DisplayName("Should throw exception when customer not found")
    void testGetCustomerProfileNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> customerService.getCustomerProfile(999L));
    }

    @Test
    @DisplayName("Should update customer profile successfully")
    void testUpdateCustomerProfileSuccess() {
        CustomerUpdateRequest request = new CustomerUpdateRequest();
        request.setFirstName("Alice Updated");
        request.setCity("New York");

        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(customerProfileRepository.findByUserId(10L)).thenReturn(Optional.of(sampleProfile));
        when(customerProfileRepository.save(any(CustomerProfile.class))).thenReturn(sampleProfile);
        when(customerMapper.toResponse(any(User.class), any(CustomerProfile.class))).thenReturn(sampleResponse);

        CustomerResponse result = customerService.updateCustomerProfile(10L, request);

        assertNotNull(result);
        verify(userRepository).save(sampleUser);
        verify(customerProfileRepository).save(sampleProfile);
    }

    @Test
    @DisplayName("Should delete own account successfully")
    void testDeleteAccountSuccess() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));

        customerService.deleteCustomerAccount(10L);

        verify(userRepository).delete(sampleUser);
    }
}

