package com.carrental.admin.service;

import com.carrental.admin.dto.request.*;
import com.carrental.admin.dto.response.*;
import com.carrental.auth.dto.response.UserResponse;
import com.carrental.driver.dto.response.DriverResponse;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.owner.dto.response.OwnerResponse;
import com.carrental.owner.enums.OwnerStatus;
import com.carrental.security.service.UserDetailsImpl;
import com.carrental.vehicle.dto.response.VehicleResponse;
import com.carrental.vehicle.enums.VehicleStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminService {

    AdminProfileResponse getAdminProfile(UserDetailsImpl userPrincipal);

    AdminDashboardResponse getAdminDashboardStats();

    PageResponse<OwnerSummaryResponse> getOwners(Pageable pageable);

    PageResponse<DriverSummaryResponse> getDrivers(Pageable pageable);

    AdminDashboardStatsResponse getDashboardStats();

    List<UserResponse> getAllUsers();

    UserResponse updateUserStatus(Long userId, AdminUserStatusUpdateRequest request);

    void deleteUser(Long userId);

    OwnerResponse updateOwnerStatus(Long ownerId, OwnerStatus status);
    OwnerResponse updateOwnerStatus(Long ownerId, OwnerStatus status, String reason);

    DriverResponse updateDriverStatus(Long driverId, DriverStatus status);
    DriverResponse updateDriverStatus(Long driverId, DriverStatus status, String reason);

    VehicleResponse updateVehicleStatus(Long vehicleId, VehicleStatus status);
    VehicleResponse updateVehicleStatus(Long vehicleId, VehicleStatus status, String reason);
}

