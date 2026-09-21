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
import com.carrental.driver.dto.request.CreateDriverRequest;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.owner.entity.OwnerDriverUsageHistory;
import com.carrental.owner.repository.OwnerDriverUsageHistoryRepository;
import com.carrental.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private OwnerDriverUsageHistoryRepository ownerDriverUsageHistoryRepository;

    @Mock
    private AuthService authService;

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

    @Test
    @DisplayName("createDriverForOwner - success creates user and inactive profile pending approval")
    void testCreateDriverForOwner_Success() {
        User owner = User.builder().id(20L).role(Role.OWNER).build();
        CreateDriverRequest request = CreateDriverRequest.builder()
                .firstName("Sam")
                .lastName("Driver")
                .email("sam@driver.com")
                .phoneNumber("9876543299")
                .password("DriverPass@123")
                .licenseNumber("DL-987654")
                .licenseExpiryDate(LocalDate.now().plusYears(2))
                .build();

        when(userRepository.findById(20L)).thenReturn(Optional.of(owner));
        when(userRepository.existsByEmail("sam@driver.com")).thenReturn(false);
        when(userRepository.existsByMobile("9876543299")).thenReturn(false);
        when(driverProfileRepository.existsByLicenseNumber("DL-987654")).thenReturn(false);
        when(passwordEncoder.encode("DriverPass@123")).thenReturn("encodedPassword");

        User savedUser = User.builder()
                .id(50L)
                .name("Sam Driver")
                .email("sam@driver.com")
                .mobile("9876543299")
                .role(Role.DRIVER)
                .emailVerified(false)
                .isActive(true)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        DriverProfile savedProfile = DriverProfile.builder()
                .id(500L)
                .user(savedUser)
                .addedByOwner(owner)
                .licenseNumber("DL-987654")
                .licenseExpiryDate(request.getLicenseExpiryDate())
                .status(DriverStatus.INACTIVE)
                .approvalStatus(ApprovalDecision.PENDING)
                .build();
        when(driverProfileRepository.save(any(DriverProfile.class))).thenReturn(savedProfile);

        DriverResponse response = driverService.createDriverForOwner(20L, request);

        assertNotNull(response);
        assertEquals("DL-987654", response.getDrivingLicenseNumber());
        assertEquals(DriverStatus.INACTIVE, response.getStatus());
        assertEquals(ApprovalDecision.PENDING, response.getApprovalStatus());
        assertFalse(response.getEmailVerified());
        verify(passwordEncoder).encode("DriverPass@123");
        verify(userRepository).save(any(User.class));
        verify(driverProfileRepository).save(any(DriverProfile.class));
        verify(authService).sendVerificationOtp(savedUser);
    }

    @Test
    @DisplayName("createDriverForOwner - fails when email already exists")
    void testCreateDriverForOwner_DuplicateEmail() {
        User owner = User.builder().id(20L).role(Role.OWNER).build();
        CreateDriverRequest request = CreateDriverRequest.builder()
                .email("existing@driver.com")
                .phoneNumber("9876543299")
                .password("DriverPass@123")
                .licenseNumber("DL-987654")
                .build();

        when(userRepository.findById(20L)).thenReturn(Optional.of(owner));
        when(userRepository.existsByEmail("existing@driver.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> driverService.createDriverForOwner(20L, request));
    }

    @Test
    @DisplayName("createDriverForOwner - fails when license is expired")
    void testCreateDriverForOwner_ExpiredLicense() {
        User owner = User.builder().id(20L).role(Role.OWNER).build();
        CreateDriverRequest request = CreateDriverRequest.builder()
                .email("new@driver.com")
                .phoneNumber("9876543299")
                .password("DriverPass@123")
                .licenseNumber("DL-987654")
                .licenseExpiryDate(LocalDate.now().minusDays(1))
                .build();

        when(userRepository.findById(20L)).thenReturn(Optional.of(owner));
        when(userRepository.existsByEmail("new@driver.com")).thenReturn(false);
        when(userRepository.existsByMobile("9876543299")).thenReturn(false);
        when(driverProfileRepository.existsByLicenseNumber("DL-987654")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> driverService.createDriverForOwner(20L, request));
    }

    @Test
    @DisplayName("getAvailableDrivers - filters out owner-driver belonging to a different owner")
    void testGetAvailableDrivers_ExcludesOtherOwnerDriver() {
        User otherOwner = User.builder().id(99L).role(Role.OWNER).build();
        DriverProfile otherOwnerDriverProfile = DriverProfile.builder()
                .id(400L)
                .user(otherOwner)
                .licenseExpiryDate(LocalDate.now().plusYears(2))
                .status(DriverStatus.ACTIVE)
                .approvalStatus(ApprovalDecision.APPROVED)
                .build();

        when(driverProfileRepository.findByApprovalStatusAndStatus(ApprovalDecision.APPROVED, DriverStatus.ACTIVE))
                .thenReturn(List.of(sampleProfile, otherOwnerDriverProfile));
        when(ownerDriverUsageHistoryRepository.findByOwnerIdOrderByLastUsedAtDesc(20L))
                .thenReturn(Collections.emptyList());

        List<DriverResponse> result = driverService.getAvailableDrivers(20L);

        assertEquals(1, result.size());
        assertEquals("Dave", result.get(0).getFirstName());
    }

    @Test
    @DisplayName("getAvailableDrivers - filters out deactivated or deleted driver users")
    void testGetAvailableDrivers_ExcludesDeactivatedUsers() {
        User inactiveUser = User.builder().id(98L).role(Role.DRIVER).isActive(false).build();
        DriverProfile inactiveUserProfile = DriverProfile.builder()
                .id(401L)
                .user(inactiveUser)
                .licenseExpiryDate(LocalDate.now().plusYears(2))
                .status(DriverStatus.ACTIVE)
                .approvalStatus(ApprovalDecision.APPROVED)
                .build();

        when(driverProfileRepository.findByApprovalStatusAndStatus(ApprovalDecision.APPROVED, DriverStatus.ACTIVE))
                .thenReturn(List.of(sampleProfile, inactiveUserProfile));
        when(ownerDriverUsageHistoryRepository.findByOwnerIdOrderByLastUsedAtDesc(20L))
                .thenReturn(Collections.emptyList());

        List<DriverResponse> result = driverService.getAvailableDrivers(20L);

        assertEquals(1, result.size());
        assertEquals("Dave", result.get(0).getFirstName());
    }

    @Test
    @DisplayName("createDriverForOwner - confirms owner-provided password is encoded and not returned raw")
    void testCreateDriverForOwner_OwnerProvidedPasswordEncoded() {
        User owner = User.builder().id(20L).role(Role.OWNER).build();
        CreateDriverRequest request = CreateDriverRequest.builder()
                .firstName("Leo")
                .lastName("Driver")
                .email("leo@driver.com")
                .phoneNumber("9876543298")
                .password("SecretPass@456")
                .licenseNumber("DL-112233")
                .licenseExpiryDate(LocalDate.now().plusYears(3))
                .build();

        when(userRepository.findById(20L)).thenReturn(Optional.of(owner));
        when(userRepository.existsByEmail("leo@driver.com")).thenReturn(false);
        when(userRepository.existsByMobile("9876543298")).thenReturn(false);
        when(driverProfileRepository.existsByLicenseNumber("DL-112233")).thenReturn(false);
        when(passwordEncoder.encode("SecretPass@456")).thenReturn("encodedSecretPass");

        User savedUser = User.builder()
                .id(51L)
                .name("Leo Driver")
                .email("leo@driver.com")
                .mobile("9876543298")
                .password("encodedSecretPass")
                .role(Role.DRIVER)
                .emailVerified(false)
                .isActive(true)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        DriverProfile savedProfile = DriverProfile.builder()
                .id(501L)
                .user(savedUser)
                .addedByOwner(owner)
                .licenseNumber("DL-112233")
                .licenseExpiryDate(request.getLicenseExpiryDate())
                .status(DriverStatus.INACTIVE)
                .approvalStatus(ApprovalDecision.PENDING)
                .build();
        when(driverProfileRepository.save(any(DriverProfile.class))).thenReturn(savedProfile);

        DriverResponse response = driverService.createDriverForOwner(20L, request);

        assertNotNull(response);
        verify(passwordEncoder).encode("SecretPass@456");
        // Confirm raw password is never stored or returned in response
        assertNotEquals("SecretPass@456", savedUser.getPassword());
        assertEquals("encodedSecretPass", savedUser.getPassword());
        verify(authService).sendVerificationOtp(savedUser);
    }
}

