package com.carrental.admin.service;

import com.carrental.admin.dto.response.AdminDriverDetailResponse;
import com.carrental.admin.dto.response.AdminOwnerDriverDetailResponse;
import com.carrental.admin.dto.response.AdminVehicleDetailResponse;
import com.carrental.admin.dto.request.ApprovalDecisionRequest;
import com.carrental.admin.dto.response.PageResponse;
import com.carrental.admin.dto.response.PendingDriverResponse;
import com.carrental.admin.dto.response.PendingOwnerDriverResponse;
import com.carrental.admin.dto.response.PendingVehicleResponse;
import com.carrental.admin.entity.Approval;
import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.admin.repository.ApprovalRepository;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.owner.entity.OwnerProfile;
import com.carrental.owner.repository.OwnerProfileRepository;
import com.carrental.security.service.UserDetailsImpl;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApprovalServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private DriverProfileRepository driverProfileRepository;

    @Mock
    private OwnerProfileRepository ownerProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApprovalRepository approvalRepository;

    @InjectMocks
    private com.carrental.admin.service.impl.ApprovalServiceImpl approvalService;

    private User adminUser;
    private UserDetailsImpl adminPrincipal;
    private User ownerUser;
    private OwnerProfile ownerProfile;
    private Vehicle vehicle;
    private DriverProfile driverProfile;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .firstName("Admin")
                .lastName("User")
                .email("admin@test.com")
                .build();

        adminPrincipal = UserDetailsImpl.builder()
                .id(1L)
                .email("admin@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();

        ownerUser = User.builder()
                .id(2L)
                .firstName("John")
                .lastName("Owner")
                .email("owner@test.com")
                .phoneNumber("9876543210")
                .role(Role.OWNER)
                .build();

        User driverUser = User.builder()
                .id(3L)
                .firstName("Driver")
                .lastName("User")
                .email("driver@test.com")
                .phoneNumber("9876543211")
                .role(Role.DRIVER)
                .build();

        ownerProfile = OwnerProfile.builder()
                .id(20L)
                .user(ownerUser)
                .build();

        vehicle = Vehicle.builder()
                .id(100L)
                .brand("Toyota")
                .model("Camry")
                .licensePlate("ABC-1234")
                .owner(ownerUser)
                .status(VehicleStatus.INACTIVE)
                .approvalStatus(ApprovalDecision.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        driverProfile = DriverProfile.builder()
                .id(200L)
                .user(driverUser)
                .drivingLicenseNumber("DL-98765")
                .licenseExpiryDate(LocalDate.now().plusYears(3))
                .status(DriverStatus.INACTIVE)
                .approvalStatus(ApprovalDecision.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("getPendingVehicles - returns mapped responses")
    void testGetPendingVehicles() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Vehicle> page = new PageImpl<>(List.of(vehicle), pageable, 1);

        when(vehicleRepository.findAllByApprovalStatusWithOwner(ApprovalDecision.PENDING, pageable)).thenReturn(page);
        when(ownerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(ownerProfile));

        PageResponse<PendingVehicleResponse> response = approvalService.getPendingVehicles(pageable);

        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).vehicleId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("getVehicleDetail - success")
    void testGetVehicleDetail() {
        when(vehicleRepository.findByIdWithOwner(100L)).thenReturn(Optional.of(vehicle));
        when(ownerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(ownerProfile));
        when(approvalRepository.findHistoryWithAdmin(any(), eq(100L))).thenReturn(Collections.emptyList());

        AdminVehicleDetailResponse response = approvalService.getVehicleDetail(100L);

        assertThat(response).isNotNull();
        assertThat(response.vehicleId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("decideVehicleApproval - approve vehicle")
    void testDecideVehicleApproval_Approve() {
        ApprovalDecisionRequest request = new ApprovalDecisionRequest(ApprovalDecision.APPROVED, null);

        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(vehicle));
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        approvalService.decideVehicleApproval(100L, request, adminPrincipal);

        assertThat(vehicle.getStatus()).isEqualTo(VehicleStatus.AVAILABLE);
        assertThat(vehicle.getApprovalStatus()).isEqualTo(ApprovalDecision.APPROVED);
        verify(vehicleRepository).save(vehicle);
        verify(approvalRepository).save(any(Approval.class));
    }

    @Test
    @DisplayName("decideVehicleApproval - reject vehicle with reason")
    void testDecideVehicleApproval_Reject() {
        ApprovalDecisionRequest request = new ApprovalDecisionRequest(ApprovalDecision.REJECTED, "Invalid insurance documents");

        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(vehicle));
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        approvalService.decideVehicleApproval(100L, request, adminPrincipal);

        assertThat(vehicle.getStatus()).isEqualTo(VehicleStatus.INACTIVE);
        assertThat(vehicle.getApprovalStatus()).isEqualTo(ApprovalDecision.REJECTED);
        verify(vehicleRepository).save(vehicle);
        verify(approvalRepository).save(any(Approval.class));
    }

    @Test
    @DisplayName("decideVehicleApproval - reject without reason throws BAD_REQUEST")
    void testDecideVehicleApproval_RejectWithoutReason() {
        ApprovalDecisionRequest request = new ApprovalDecisionRequest(ApprovalDecision.REJECTED, "");

        assertThatThrownBy(() -> approvalService.decideVehicleApproval(100L, request, adminPrincipal))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    @DisplayName("decideVehicleApproval - non-pending vehicle throws CONFLICT")
    void testDecideVehicleApproval_NonPending() {
        vehicle.setApprovalStatus(ApprovalDecision.APPROVED);
        ApprovalDecisionRequest request = new ApprovalDecisionRequest(ApprovalDecision.APPROVED, null);

        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> approvalService.decideVehicleApproval(100L, request, adminPrincipal))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    @DisplayName("getPendingDrivers - returns pending drivers")
    void testGetPendingDrivers() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<DriverProfile> page = new PageImpl<>(List.of(driverProfile), pageable, 1);

        when(driverProfileRepository.findAllByApprovalStatusWithDetails(ApprovalDecision.PENDING, pageable)).thenReturn(page);
        when(ownerProfileRepository.findByUserId(3L)).thenReturn(Optional.of(ownerProfile));

        PageResponse<PendingDriverResponse> response = approvalService.getPendingDrivers(pageable);

        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
    }

    @Test
    @DisplayName("getDriverDetail - success")
    void testGetDriverDetail() {
        when(driverProfileRepository.findByIdWithDetails(200L)).thenReturn(Optional.of(driverProfile));
        when(ownerProfileRepository.findByUserId(3L)).thenReturn(Optional.of(ownerProfile));
        when(approvalRepository.findHistoryWithAdmin(any(), eq(200L))).thenReturn(Collections.emptyList());

        AdminDriverDetailResponse response = approvalService.getDriverDetail(200L);

        assertThat(response).isNotNull();
        assertThat(response.driverId()).isEqualTo(200L);
    }

    @Test
    @DisplayName("decideDriverApproval - approve driver")
    void testDecideDriverApproval_Approve() {
        ApprovalDecisionRequest request = new ApprovalDecisionRequest(ApprovalDecision.APPROVED, null);

        when(driverProfileRepository.findByIdWithDetails(200L)).thenReturn(Optional.of(driverProfile));
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        approvalService.decideDriverApproval(200L, request, adminPrincipal);

        assertThat(driverProfile.getStatus()).isEqualTo(DriverStatus.ACTIVE);
        assertThat(driverProfile.getApprovalStatus()).isEqualTo(ApprovalDecision.APPROVED);
        verify(driverProfileRepository).save(driverProfile);
        verify(approvalRepository).save(any(Approval.class));
    }

    @Test
    @DisplayName("decideDriverApproval - owner-as-driver throws CONFLICT")
    void testDecideDriverApproval_OwnerAsDriver() {
        driverProfile.setUser(ownerUser);
        ApprovalDecisionRequest request = new ApprovalDecisionRequest(ApprovalDecision.APPROVED, null);

        when(driverProfileRepository.findByIdWithDetails(200L)).thenReturn(Optional.of(driverProfile));

        assertThatThrownBy(() -> approvalService.decideDriverApproval(200L, request, adminPrincipal))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    @DisplayName("getPendingOwnerDrivers - returns pending owner drivers")
    void testGetPendingOwnerDrivers() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<DriverProfile> page = new PageImpl<>(List.of(driverProfile), pageable, 1);

        when(driverProfileRepository.findPendingOwnerDrivers(ApprovalDecision.PENDING, pageable)).thenReturn(page);

        PageResponse<PendingOwnerDriverResponse> response = approvalService.getPendingOwnerDrivers(pageable);

        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
    }

    @Test
    @DisplayName("getOwnerDriverDetail - success")
    void testGetOwnerDriverDetail() {
        when(driverProfileRepository.findOwnerDriverById(200L)).thenReturn(Optional.of(driverProfile));
        when(approvalRepository.findHistoryWithAdmin(any(), eq(200L))).thenReturn(Collections.emptyList());

        AdminOwnerDriverDetailResponse response = approvalService.getOwnerDriverDetail(200L);

        assertThat(response).isNotNull();
        assertThat(response.driverProfileId()).isEqualTo(200L);
    }

    @Test
    @DisplayName("decideOwnerDriverApproval - approve owner-driver")
    void testDecideOwnerDriverApproval_Approve() {
        ApprovalDecisionRequest request = new ApprovalDecisionRequest(ApprovalDecision.APPROVED, null);

        when(driverProfileRepository.findOwnerDriverById(200L)).thenReturn(Optional.of(driverProfile));
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        approvalService.decideOwnerDriverApproval(200L, request, adminPrincipal);

        assertThat(driverProfile.getStatus()).isEqualTo(DriverStatus.ACTIVE);
        assertThat(driverProfile.getApprovalStatus()).isEqualTo(ApprovalDecision.APPROVED);
        verify(driverProfileRepository).save(driverProfile);
        verify(approvalRepository).save(any(Approval.class));
    }
}

