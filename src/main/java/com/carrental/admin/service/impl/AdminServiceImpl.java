package com.carrental.admin.service.impl;

import com.carrental.admin.service.AdminService;

import com.carrental.admin.dto.request.*;
import com.carrental.admin.dto.response.*;
import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.auth.dto.response.UserResponse;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.mapper.AuthMapper;
import com.carrental.auth.repository.UserRepository;
import java.time.LocalDateTime;
import com.carrental.booking.enums.BookingStatus;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final AuthMapper authMapper;

    @Autowired(required = false)
    private CustomerProfileRepository customerProfileRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminProfileResponse getAdminProfile(UserDetailsImpl userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin user not found"));

        List<String> roles = user.getRole() != null ? List.of(user.getRole().name()) : List.of();

        return new AdminProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                roles,
                user.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboardStats() {
        long totalOwners = ownerProfileRepository.count();
        long totalCustomers = customerProfileRepository != null ? customerProfileRepository.count() : userRepository.countByRole(Role.CUSTOMER);
        long totalDrivers = driverProfileRepository.count();
        long totalVehicles = vehicleRepository.count();

        long pendingVehicleApprovals = vehicleRepository.countByApprovalStatus(ApprovalDecision.PENDING);
        long pendingDriverApprovals = driverProfileRepository.countPendingDrivers(ApprovalDecision.PENDING);
        long pendingOwnerDriverApprovals = driverProfileRepository.countPendingOwnerDrivers(ApprovalDecision.PENDING);
        long totalPendingApprovals = pendingVehicleApprovals + pendingDriverApprovals + pendingOwnerDriverApprovals;

        long activeVehicles = vehicleRepository.countByStatusIn(List.of(VehicleStatus.AVAILABLE, VehicleStatus.BOOKED, VehicleStatus.ON_TRIP));
        long inactiveVehicles = vehicleRepository.countByStatusIn(List.of(VehicleStatus.INACTIVE, VehicleStatus.MAINTENANCE));
        long deletedAccounts = userRepository.countByDeletedAtIsNotNull();

        return new AdminDashboardResponse(
                totalOwners,
                totalCustomers,
                totalDrivers,
                totalVehicles,
                pendingVehicleApprovals,
                pendingDriverApprovals,
                pendingOwnerDriverApprovals,
                totalPendingApprovals,
                activeVehicles,
                inactiveVehicles,
                deletedAccounts
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OwnerSummaryResponse> getOwners(Pageable pageable) {
        Page<OwnerProfile> page = ownerProfileRepository.findAllWithUser(pageable);

        Page<OwnerSummaryResponse> mapped = page.map(owner ->
                new OwnerSummaryResponse(
                        owner.getId(),
                        owner.getUser().getId(),
                        owner.getUser().getFullName(),
                        owner.getUser().getEmail(),
                        owner.getUser().getPhoneNumber(),
                        owner.getUser().getFullName() + "'s Fleet",
                        owner.getStatus() == OwnerStatus.APPROVED,
                        owner.getCreatedAt()
                ));
        return PageResponse.from(mapped);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DriverSummaryResponse> getDrivers(Pageable pageable) {
        Page<DriverProfile> page = driverProfileRepository.findAllWithDetails(pageable);

        Page<DriverSummaryResponse> mapped = page.map(driver ->
                new DriverSummaryResponse(
                        driver.getId(),
                        driver.getUser().getId(),
                        driver.getUser().getFullName(),
                        driver.getUser().getEmail(),
                        driver.getUser().getPhoneNumber(),
                        driver.getDrivingLicenseNumber(),
                        driver.getLicenseExpiryDate(),
                        driver.getApprovalStatus() != null ? driver.getApprovalStatus().name() : "PENDING",
                        driver.getStatus() != null ? driver.getStatus().name() : "INACTIVE",
                        driver.getUser().getFullName(),
                        driver.getUser().getEmail(),
                        driver.getCreatedAt()
                ));
        return PageResponse.from(mapped);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalOwners = userRepository.countByRole(Role.OWNER);
        long totalDrivers = userRepository.countByRole(Role.DRIVER);
        long totalVehicles = vehicleRepository.count();
        long totalBookings = bookingRepository.count();
        long activeBookings = bookingRepository.countByBookingStatus(BookingStatus.IN_PROGRESS) +
                              bookingRepository.countByBookingStatus(BookingStatus.CONFIRMED);
        BigDecimal totalRevenue = bookingRepository.calculateTotalRevenue();

        Map<String, Long> roleCounts = new HashMap<>();
        roleCounts.put("CUSTOMERS", totalCustomers);
        roleCounts.put("OWNERS", totalOwners);
        roleCounts.put("DRIVERS", totalDrivers);
        roleCounts.put("ADMINS", userRepository.countByRole(Role.ADMIN));

        return AdminDashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalCustomers(totalCustomers)
                .totalOwners(totalOwners)
                .totalDrivers(totalDrivers)
                .totalVehicles(totalVehicles)
                .totalBookings(totalBookings)
                .activeBookings(activeBookings)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .userCountByRole(roleCounts)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(authMapper::toUserResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(Long userId, AdminUserStatusUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        } else if (request.getEnabled() != null) {
            user.setIsActive(request.getEnabled());
        }
        if (request.getEmailVerified() != null) {
            user.setEmailVerified(request.getEmailVerified());
        }
        if (request.getAccountNonLocked() != null) {
            user.setAccountNonLocked(request.getAccountNonLocked());
        }

        User saved = userRepository.save(user);
        log.info("Admin updated user status for ID: {} [enabled: {}, non-locked: {}]",
                userId, saved.isEnabled(), saved.isAccountNonLocked());

        return authMapper.toUserResponse(saved);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        userRepository.delete(user);
        log.info("Admin deleted user ID: {}", userId);
    }

    @Override
    @Transactional
    public OwnerResponse updateOwnerStatus(Long ownerId, OwnerStatus status) {
        OwnerProfile owner = ownerProfileRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("OwnerProfile", "id", ownerId));

        owner.setStatus(status);
        OwnerProfile saved = ownerProfileRepository.save(owner);
        User user = saved.getUser();

        log.info("Admin updated owner status to {} for owner id: {}", status, ownerId);
        return OwnerResponse.builder()
                .id(saved.getId())
                .userId(user != null ? user.getId() : null)
                .firstName(user != null ? user.getFirstName() : null)
                .lastName(user != null ? user.getLastName() : null)
                .email(user != null ? user.getEmail() : null)
                .phoneNumber(user != null ? user.getPhoneNumber() : null)
                .role(user != null ? user.getRole() : null)
                .status(saved.getStatus())
                .createdAt(user != null ? user.getCreatedAt() : null)
                .build();
    }

    @Override
    @Transactional
    public DriverResponse updateDriverStatus(Long driverId, DriverStatus status) {
        DriverProfile driver = driverProfileRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("DriverProfile", "id", driverId));

        driver.setStatus(status);
        if (status == DriverStatus.ACTIVE || status == DriverStatus.ON_TRIP) {
            driver.setInactiveReason(null);
        }
        DriverProfile saved = driverProfileRepository.save(driver);
        User user = saved.getUser();

        log.info("Admin updated driver status to {} for driver id: {}", status, driverId);
        return DriverResponse.builder()
                .id(saved.getId())
                .userId(user != null ? user.getId() : null)
                .firstName(user != null ? user.getFirstName() : null)
                .lastName(user != null ? user.getLastName() : null)
                .email(user != null ? user.getEmail() : null)
                .phoneNumber(user != null ? user.getPhoneNumber() : null)
                .role(user != null ? user.getRole() : null)
                .drivingLicenseNumber(saved.getDrivingLicenseNumber())
                .licenseExpiryDate(saved.getLicenseExpiryDate())
                .status(saved.getStatus())
                .approvalStatus(saved.getApprovalStatus())
                .inactiveReason(saved.getInactiveReason())
                .createdAt(user != null ? user.getCreatedAt() : null)
                .build();
    }

    @Override
    @Transactional
    public VehicleResponse updateVehicleStatus(Long vehicleId, VehicleStatus status) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        vehicle.setStatus(status);
        Vehicle saved = vehicleRepository.save(vehicle);

        log.info("Admin updated vehicle status to {} for vehicle id: {}", status, vehicleId);
        return VehicleResponse.builder()
                .id(saved.getId())
                .brand(saved.getBrand())
                .model(saved.getModel())
                .year(saved.getYear())
                .licensePlate(saved.getLicensePlate())
                .pricePerKm(saved.getPricePerKm())
                .seatingCapacity(saved.getSeatingCapacity())
                .vehicleType(saved.getVehicleType())
                .fuelType(saved.getFuelType())
                .status(saved.getStatus())
                .approvalStatus(saved.getApprovalStatus())
                .location(saved.getLocation())
                .description(saved.getDescription())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}

