package com.carrental.admin.service;

import com.carrental.admin.service.impl.AdminServiceImpl;

import com.carrental.admin.dto.response.AdminDashboardResponse;
import com.carrental.admin.dto.response.AdminDashboardStatsResponse;
import com.carrental.admin.dto.response.AdminProfileResponse;
import com.carrental.admin.dto.request.AdminUserStatusUpdateRequest;
import com.carrental.admin.dto.response.DriverSummaryResponse;
import com.carrental.admin.dto.response.OwnerSummaryResponse;
import com.carrental.admin.dto.response.PageResponse;
import com.carrental.auth.dto.response.UserResponse;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.mapper.AuthMapper;
import com.carrental.auth.repository.UserRepository;
import com.carrental.booking.repository.BookingRepository;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.customer.repository.CustomerProfileRepository;
import com.carrental.driver.dto.response.DriverResponse;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.owner.dto.response.OwnerResponse;
import com.carrental.owner.entity.OwnerProfile;
import com.carrental.owner.enums.OwnerStatus;
import com.carrental.owner.repository.OwnerProfileRepository;
import com.carrental.security.service.UserDetailsImpl;
import com.carrental.vehicle.dto.response.VehicleResponse;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OwnerProfileRepository ownerProfileRepository;

    @Mock
    private DriverProfileRepository driverProfileRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private AuthMapper authMapper;

    @Mock
    private CustomerProfileRepository customerProfileRepository;

    @InjectMocks
    private AdminServiceImpl adminService;

    private User adminUser;
    private UserDetailsImpl userPrincipal;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .firstName("Admin")
                .lastName("User")
                .email("admin@test.com")
                .phoneNumber("1234567890")
                .role(Role.ROLE_ADMIN)
                .enabled(true)
                .accountNonLocked(true)
                .createdAt(LocalDateTime.now())
                .build();

        userPrincipal = UserDetailsImpl.builder()
                .id(1L)
                .email("admin@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();

        org.springframework.test.util.ReflectionTestUtils.setField(adminService, "customerProfileRepository", customerProfileRepository);
    }

    @Test
    @DisplayName("getAdminProfile - success")
    void testGetAdminProfile_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        AdminProfileResponse response = adminService.getAdminProfile(userPrincipal);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.email()).isEqualTo("admin@test.com");
    }

    @Test
    @DisplayName("getAdminProfile - not found throws ResponseStatusException")
    void testGetAdminProfile_NotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.getAdminProfile(userPrincipal))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    @DisplayName("getAdminDashboardStats - returns counts")
    void testGetAdminDashboardStats() {
        when(ownerProfileRepository.count()).thenReturn(5L);
        when(customerProfileRepository.count()).thenReturn(20L);
        when(driverProfileRepository.count()).thenReturn(8L);
        when(vehicleRepository.count()).thenReturn(15L);
        when(vehicleRepository.countByStatus(VehicleStatus.PENDING)).thenReturn(2L);
        when(driverProfileRepository.countByStatusAndWillingToDrive(DriverStatus.PENDING, false)).thenReturn(1L);
        when(driverProfileRepository.countByStatusAndWillingToDrive(DriverStatus.PENDING, true)).thenReturn(1L);
        when(vehicleRepository.countByStatusIn(any())).thenReturn(10L);
        when(userRepository.countByDeletedAtIsNotNull()).thenReturn(3L);

        AdminDashboardResponse response = adminService.getAdminDashboardStats();

        assertThat(response).isNotNull();
        assertThat(response.totalOwners()).isEqualTo(5L);
        assertThat(response.totalCustomers()).isEqualTo(20L);
        assertThat(response.totalDrivers()).isEqualTo(8L);
        assertThat(response.totalVehicles()).isEqualTo(15L);
        assertThat(response.totalPendingApprovals()).isEqualTo(4L);
    }

    @Test
    @DisplayName("getOwners - returns paged owner summaries")
    void testGetOwners() {
        Pageable pageable = PageRequest.of(0, 10);
        OwnerProfile ownerProfile = OwnerProfile.builder()
                .id(10L)
                .user(adminUser)
                .status(OwnerStatus.APPROVED)
                .createdAt(LocalDateTime.now())
                .build();
        Page<OwnerProfile> page = new PageImpl<>(List.of(ownerProfile), pageable, 1);

        when(ownerProfileRepository.findAllWithUser(pageable)).thenReturn(page);

        PageResponse<OwnerSummaryResponse> response = adminService.getOwners(pageable);

        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).ownerId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("getDrivers - returns paged driver summaries")
    void testGetDrivers() {
        Pageable pageable = PageRequest.of(0, 10);
        DriverProfile driverProfile = DriverProfile.builder()
                .id(20L)
                .user(adminUser)
                .drivingLicenseNumber("DL-12345")
                .status(DriverStatus.AVAILABLE)
                .createdAt(LocalDateTime.now())
                .build();
        Page<DriverProfile> page = new PageImpl<>(List.of(driverProfile), pageable, 1);

        when(driverProfileRepository.findAllWithDetails(pageable)).thenReturn(page);

        PageResponse<DriverSummaryResponse> response = adminService.getDrivers(pageable);

        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).licenseNumber()).isEqualTo("DL-12345");
    }

    @Test
    @DisplayName("getDashboardStats - returns aggregate stats and role counts")
    void testGetDashboardStats() {
        when(userRepository.count()).thenReturn(50L);
        when(userRepository.countByRole(com.carrental.auth.enums.Role.CUSTOMER)).thenReturn(30L);
        when(userRepository.countByRole(com.carrental.auth.enums.Role.OWNER)).thenReturn(10L);
        when(userRepository.countByRole(com.carrental.auth.enums.Role.DRIVER)).thenReturn(8L);
        when(userRepository.countByRole(com.carrental.auth.enums.Role.ADMIN)).thenReturn(2L);
        when(vehicleRepository.count()).thenReturn(15L);
        when(bookingRepository.count()).thenReturn(100L);
        when(bookingRepository.countByBookingStatus(any())).thenReturn(10L);
        when(bookingRepository.calculateTotalRevenue()).thenReturn(BigDecimal.valueOf(50000));

        AdminDashboardStatsResponse response = adminService.getDashboardStats();

        assertThat(response).isNotNull();
        assertThat(response.getTotalUsers()).isEqualTo(50L);
        assertThat(response.getTotalRevenue()).isEqualTo(BigDecimal.valueOf(50000));
        assertThat(response.getUserCountByRole()).containsEntry("CUSTOMERS", 30L);
    }

    @Test
    @DisplayName("getAllUsers - returns mapped user responses")
    void testGetAllUsers() {
        UserResponse uResp = UserResponse.builder().id(1L).email("admin@test.com").build();
        when(userRepository.findAll()).thenReturn(List.of(adminUser));
        when(authMapper.toUserResponse(adminUser)).thenReturn(uResp);

        List<UserResponse> list = adminService.getAllUsers();

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getEmail()).isEqualTo("admin@test.com");
    }

    @Test
    @DisplayName("updateUserStatus - updates enabled and accountNonLocked")
    void testUpdateUserStatus() {
        AdminUserStatusUpdateRequest request = new AdminUserStatusUpdateRequest(false, false);
        UserResponse uResp = UserResponse.builder().id(1L).enabled(false).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userRepository.save(adminUser)).thenReturn(adminUser);
        when(authMapper.toUserResponse(adminUser)).thenReturn(uResp);

        UserResponse response = adminService.updateUserStatus(1L, request);

        assertThat(response.isEnabled()).isFalse();
        verify(userRepository).save(adminUser);
    }

    @Test
    @DisplayName("deleteUser - success")
    void testDeleteUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        adminService.deleteUser(1L);

        verify(userRepository).delete(adminUser);
    }

    @Test
    @DisplayName("deleteUser - not found throws ResourceNotFoundException")
    void testDeleteUser_NotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.deleteUser(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("updateOwnerStatus - updates and returns OwnerResponse")
    void testUpdateOwnerStatus() {
        OwnerProfile ownerProfile = OwnerProfile.builder()
                .id(10L)
                .user(adminUser)
                .status(OwnerStatus.PENDING)
                .build();

        when(ownerProfileRepository.findById(10L)).thenReturn(Optional.of(ownerProfile));
        when(ownerProfileRepository.save(ownerProfile)).thenReturn(ownerProfile);

        OwnerResponse response = adminService.updateOwnerStatus(10L, OwnerStatus.APPROVED);

        assertThat(response).isNotNull();
        assertThat(ownerProfile.getStatus()).isEqualTo(OwnerStatus.APPROVED);
        verify(ownerProfileRepository).save(ownerProfile);
    }

    @Test
    @DisplayName("updateDriverStatus - updates and returns DriverResponse")
    void testUpdateDriverStatus() {
        DriverProfile driverProfile = DriverProfile.builder()
                .id(20L)
                .user(adminUser)
                .status(DriverStatus.PENDING)
                .build();

        when(driverProfileRepository.findById(20L)).thenReturn(Optional.of(driverProfile));
        when(driverProfileRepository.save(driverProfile)).thenReturn(driverProfile);

        DriverResponse response = adminService.updateDriverStatus(20L, DriverStatus.APPROVED);

        assertThat(response).isNotNull();
        assertThat(driverProfile.getStatus()).isEqualTo(DriverStatus.APPROVED);
        verify(driverProfileRepository).save(driverProfile);
    }

    @Test
    @DisplayName("updateVehicleStatus - updates and returns VehicleResponse")
    void testUpdateVehicleStatus() {
        Vehicle vehicle = Vehicle.builder()
                .id(30L)
                .brand("Toyota")
                .model("Camry")
                .status(VehicleStatus.PENDING)
                .owner(adminUser)
                .build();

        when(vehicleRepository.findById(30L)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(vehicle)).thenReturn(vehicle);

        VehicleResponse response = adminService.updateVehicleStatus(30L, VehicleStatus.AVAILABLE);

        assertThat(response).isNotNull();
        assertThat(vehicle.getStatus()).isEqualTo(VehicleStatus.AVAILABLE);
        verify(vehicleRepository).save(vehicle);
    }
}

