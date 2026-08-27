package com.carrental.customer.service;

import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.customer.dto.CustomerResponse;
import com.carrental.customer.dto.CustomerUpdateRequest;
import com.carrental.customer.entity.CustomerProfile;
import com.carrental.customer.mapper.CustomerMapper;
import com.carrental.customer.repository.CustomerProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CustomerProfileRepository customerProfileRepository;

    private CustomerMapper customerMapper = Mappers.getMapper(CustomerMapper.class);

    private CustomerServiceImpl customerService;

    private User sampleUser;
    private CustomerProfile sampleProfile;

    @BeforeEach
    void setUp() {
        customerService = new CustomerServiceImpl(userRepository, customerProfileRepository, customerMapper);

        sampleUser = User.builder()
                .id(10L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .phoneNumber("+1234567890")
                .role(Role.ROLE_CUSTOMER)
                .emailVerified(true)
                .accountNonLocked(true)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        sampleProfile = CustomerProfile.builder()
                .id(1L)
                .user(sampleUser)
                .address("123 Main Street")
                .city("New York")
                .postalCode("10001")
                .build();
    }

    @Test
    @DisplayName("Should retrieve customer profile successfully")
    void testGetCustomerProfileSuccess() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(customerProfileRepository.findByUserId(10L)).thenReturn(Optional.of(sampleProfile));

        CustomerResponse response = customerService.getCustomerProfile(10L);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertEquals("John Doe", response.getFullName());
        assertEquals("john.doe@example.com", response.getEmail());
        assertEquals("+1234567890", response.getPhoneNumber());
        assertEquals(Role.ROLE_CUSTOMER, response.getRole());
        assertEquals("123 Main Street", response.getAddress());
        assertEquals("New York", response.getCity());
        assertEquals("10001", response.getPostalCode());
        assertTrue(response.isEmailVerified());
    }

    @Test
    @DisplayName("Should retrieve customer profile when profile record does not yet exist")
    void testGetCustomerProfileWhenProfileNull() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(customerProfileRepository.findByUserId(10L)).thenReturn(Optional.empty());

        CustomerResponse response = customerService.getCustomerProfile(10L);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("John Doe", response.getFullName());
        assertNull(response.getAddress());
        assertNull(response.getCity());
        assertNull(response.getPostalCode());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user does not exist")
    void testGetCustomerProfileUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> customerService.getCustomerProfile(99L));
    }

    @Test
    @DisplayName("Should update existing customer profile successfully")
    void testUpdateCustomerProfileSuccess() {
        CustomerUpdateRequest request = CustomerUpdateRequest.builder()
                .firstName("Johnny")
                .lastName("Doeman")
                .phoneNumber("+9876543210")
                .address("456 Broadway")
                .city("Los Angeles")
                .postalCode("90001")
                .build();

        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(customerProfileRepository.findByUserId(10L)).thenReturn(Optional.of(sampleProfile));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(customerProfileRepository.save(any(CustomerProfile.class))).thenAnswer(i -> i.getArgument(0));

        CustomerResponse response = customerService.updateCustomerProfile(10L, request);

        assertNotNull(response);
        assertEquals("Johnny", response.getFirstName());
        assertEquals("Doeman", response.getLastName());
        assertEquals("Johnny Doeman", response.getFullName());
        assertEquals("+9876543210", response.getPhoneNumber());
        assertEquals("456 Broadway", response.getAddress());
        assertEquals("Los Angeles", response.getCity());
        assertEquals("90001", response.getPostalCode());

        verify(userRepository).save(sampleUser);
        verify(customerProfileRepository).save(sampleProfile);
    }

    @Test
    @DisplayName("Should create customer profile when updating if profile does not exist yet")
    void testUpdateCustomerProfileWhenProfileEmpty() {
        CustomerUpdateRequest request = CustomerUpdateRequest.builder()
                .address("789 First Ave")
                .city("Chicago")
                .postalCode("60601")
                .build();

        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(customerProfileRepository.findByUserId(10L)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(customerProfileRepository.save(any(CustomerProfile.class))).thenAnswer(i -> i.getArgument(0));

        CustomerResponse response = customerService.updateCustomerProfile(10L, request);

        assertNotNull(response);
        assertEquals("John Doe", response.getFullName());
        assertEquals("789 First Ave", response.getAddress());
        assertEquals("Chicago", response.getCity());
        assertEquals("60601", response.getPostalCode());

        verify(customerProfileRepository).save(any(CustomerProfile.class));
    }
}
