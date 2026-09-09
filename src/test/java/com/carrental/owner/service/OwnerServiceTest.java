package com.carrental.owner.service;

import com.carrental.owner.service.impl.OwnerServiceImpl;

import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.owner.dto.response.OwnerResponse;
import com.carrental.owner.dto.request.OwnerUpdateRequest;
import com.carrental.owner.entity.OwnerProfile;
import com.carrental.owner.enums.OwnerStatus;
import com.carrental.owner.repository.OwnerProfileRepository;
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
@DisplayName("OwnerService Unit Tests")
class OwnerServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OwnerProfileRepository ownerProfileRepository;

    @Mock
    private DriverProfileRepository driverProfileRepository;

    @InjectMocks
    private OwnerServiceImpl ownerService;

    private User sampleUser;
    private OwnerProfile sampleProfile;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(20L)
                .firstName("Bob")
                .lastName("Builder")
                .email("bob@example.com")
                .phoneNumber("9876543201")
                .role(Role.ROLE_OWNER)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        sampleProfile = OwnerProfile.builder()
                .id(200L)
                .user(sampleUser)
                .status(OwnerStatus.APPROVED)
                .build();
    }

    @Test
    @DisplayName("Should get owner profile")
    void testGetOwnerProfileSuccess() {
        when(userRepository.findById(20L)).thenReturn(Optional.of(sampleUser));
        when(ownerProfileRepository.findByUserId(20L)).thenReturn(Optional.of(sampleProfile));
        when(driverProfileRepository.findByUserId(20L)).thenReturn(Optional.empty());

        OwnerResponse response = ownerService.getOwnerProfile(20L);

        assertNotNull(response);
        assertEquals("Bob", response.getFirstName());
        assertEquals("bob@example.com", response.getEmail());
    }

    @Test
    @DisplayName("Should throw exception when owner not found")
    void testGetOwnerProfileNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> ownerService.getOwnerProfile(999L));
    }

    @Test
    @DisplayName("Should update owner profile successfully")
    void testUpdateOwnerProfileSuccess() {
        OwnerUpdateRequest request = new OwnerUpdateRequest();
        request.setFirstName("Bob Updated");

        when(userRepository.findById(20L)).thenReturn(Optional.of(sampleUser));
        when(ownerProfileRepository.findByUserId(20L)).thenReturn(Optional.of(sampleProfile));
        when(driverProfileRepository.findByUserId(20L)).thenReturn(Optional.empty());

        OwnerResponse response = ownerService.updateOwnerProfile(20L, request);

        assertNotNull(response);
        verify(userRepository).save(sampleUser);
    }
}

