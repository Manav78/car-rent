package com.carrental.admin.service;

import com.carrental.admin.dto.AdminDashboardStatsResponse;
import com.carrental.admin.dto.AdminUserStatusUpdateRequest;
import com.carrental.auth.dto.response.UserResponse;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.mapper.AuthMapper;
import com.carrental.auth.repository.UserRepository;
import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.repository.BookingRepository;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final AuthMapper authMapper;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(Role.ROLE_CUSTOMER);
        long totalOwners = userRepository.countByRole(Role.ROLE_OWNER);
        long totalDrivers = userRepository.countByRole(Role.ROLE_DRIVER);
        long totalVehicles = vehicleRepository.count();
        long totalBookings = bookingRepository.count();
        long activeBookings = bookingRepository.countByBookingStatus(BookingStatus.IN_PROGRESS) +
                              bookingRepository.countByBookingStatus(BookingStatus.CONFIRMED);
        BigDecimal totalRevenue = bookingRepository.calculateTotalRevenue();

        Map<String, Long> roleCounts = new HashMap<>();
        roleCounts.put("CUSTOMERS", totalCustomers);
        roleCounts.put("OWNERS", totalOwners);
        roleCounts.put("DRIVERS", totalDrivers);
        roleCounts.put("ADMINS", userRepository.countByRole(Role.ROLE_ADMIN));

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

        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
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
}
