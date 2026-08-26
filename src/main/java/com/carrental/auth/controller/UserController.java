package com.carrental.auth.controller;

import com.carrental.auth.dto.response.ApiResponse;
import com.carrental.auth.dto.response.UserResponse;
import com.carrental.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", authService.getCurrentUser()));
    }

    @GetMapping("/admin-dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> getAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard accessed successfully",
                Map.of("message", "Welcome Admin! You have full system access.")));
    }

    @GetMapping("/owner-dashboard")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> getOwnerDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Owner dashboard accessed successfully",
                Map.of("message", "Welcome Car Owner! You can manage your vehicles.")));
    }

    @GetMapping("/customer-dashboard")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> getCustomerDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Customer dashboard accessed successfully",
                Map.of("message", "Welcome Customer! You can browse and book cars.")));
    }

    @GetMapping("/driver-dashboard")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDriverDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Driver dashboard accessed successfully",
                Map.of("message", "Welcome Driver! You can view assigned trips.")));
    }
}
