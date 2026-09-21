package com.carrental.driver.dto.response;

import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.auth.enums.Role;
import com.carrental.driver.enums.DriverStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Role role;
    private Boolean emailVerified;
    private String drivingLicenseNumber;
    private LocalDate licenseExpiryDate;
    private DriverStatus status;
    private ApprovalDecision approvalStatus;
    private String inactiveReason;
    private String rejectionReason;
    private LocalDateTime createdAt;
}


