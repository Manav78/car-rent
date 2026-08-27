package com.carrental.admin.service;

import com.carrental.admin.dto.AdminDashboardStatsResponse;
import com.carrental.admin.dto.AdminUserStatusUpdateRequest;
import com.carrental.auth.dto.response.UserResponse;

import java.util.List;

public interface AdminService {

    AdminDashboardStatsResponse getDashboardStats();

    List<UserResponse> getAllUsers();

    UserResponse updateUserStatus(Long userId, AdminUserStatusUpdateRequest request);

    void deleteUser(Long userId);
}
