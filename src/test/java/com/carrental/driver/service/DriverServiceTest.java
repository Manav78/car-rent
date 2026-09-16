package com.carrental.driver.service;

import com.carrental.driver.service.impl.DriverServiceImpl;

import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.BadRequestException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.driver.dto.request.DriverRequest;
import com.carrental.driver.dto.response.DriverResponse;
import com.carrental.driver.dto.request.DriverStatusUpdateRequest;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DriverService Unit Tests")
class DriverServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DriverProfileRepository driverProfileRepository;

    @InjectMocks
    private DriverServiceImpl driverService;

    private User sampleUser;
    private DriverProfile sampleProfile;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(30L)
                .firstName("Dave")
                .lastName("Driver")
                .email("dave@example.com")
                .phoneNumber("9876543202")
                .role(Role.DRIVER)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        sampleProfile = DriverProfile.builder()
                .id(300L)
                .user(sampleUser)
                .drivingLicenseNumber("DL-12345678")
                .licenseExpiryDate(LocalDate.now().plusYears(3))
                .status(DriverStatus.ACTIVE)
                .approvalStatus(ApprovalDecision.APPROVED)
                .build();
    }

    @Test
    @DisplayName("Should get driver profile")
    void testGetDriverProfile() {
        when(userRepository.findById(30L)).thenReturn(Optional.of(sampleUser));
        when(driverProfileRepository.findByUserId(30L)).thenReturn(Optional.of(sampleProfile));

        DriverResponse response = driverService.getDriverProfile(30L);

        assertNotNull(response);
        assertEquals("Dave", response.getFirstName());
        assertEquals(DriverStatus.ACTIVE, response.getStatus());
    }

    @Test
    @DisplayName("Should update driver status")
    void testUpdateStatus() {
        DriverStatusUpdateRequest request = new DriverStatusUpdateRequest();
        request.setStatus(DriverStatus.ON_TRIP);

        when(userRepository.findById(30L)).thenReturn(Optional.of(sampleUser));
        when(driverProfileRepository.findByUserId(30L)).thenReturn(Optional.of(sampleProfile));
        when(driverProfileRepository.save(any(DriverProfile.class))).thenReturn(sampleProfile);

        DriverResponse response = driverService.updateStatus(30L, request);

        assertNotNull(response);
        assertEquals(DriverStatus.ON_TRIP, sampleProfile.getStatus());
        verify(driverProfileRepository).save(sampleProfile);
    }

    @Test
    @DisplayName("Should fail when updating status to INACTIVE without reason")
    void testUpdateStatus_InactiveWithoutReason() {
        DriverStatusUpdateRequest request = new DriverStatusUpdateRequest();
        request.setStatus(DriverStatus.INACTIVE);

        when(userRepository.findById(30L)).thenReturn(Optional.of(sampleUser));
        when(driverProfileRepository.findByUserId(30L)).thenReturn(Optional.of(sampleProfile));

        assertThrows(BadRequestException.class, () -> driverService.updateStatus(30L, request));
    }

    @Test
    @DisplayName("Should successfully update status to INACTIVE with reason")
    void testUpdateStatus_InactiveWithReason() {
        DriverStatusUpdateRequest request = DriverStatusUpdateRequest.builder()
                .status(DriverStatus.INACTIVE)
                .inactiveReason("On medical leave")
                .build();

        when(userRepository.findById(30L)).thenReturn(Optional.of(sampleUser));
        when(driverProfileRepository.findByUserId(30L)).thenReturn(Optional.of(sampleProfile));
        when(driverProfileRepository.save(any(DriverProfile.class))).thenReturn(sampleProfile);

        DriverResponse response = driverService.updateStatus(30L, request);

        assertNotNull(response);
        assertEquals(DriverStatus.INACTIVE, sampleProfile.getStatus());
        assertEquals("On medical leave", sampleProfile.getInactiveReason());
        verify(driverProfileRepository).save(sampleProfile);
    }

    @Test
    @DisplayName("Should list available drivers")
    void testGetAvailableDrivers() {
        when(driverProfileRepository.findByApprovalStatusAndStatus(ApprovalDecision.APPROVED, DriverStatus.ACTIVE)).thenReturn(List.of(sampleProfile));

        List<DriverResponse> available = driverService.getAvailableDrivers();

        assertNotNull(available);
        assertEquals(1, available.size());
        assertEquals("Dave", available.get(0).getFirstName());
    }
}

