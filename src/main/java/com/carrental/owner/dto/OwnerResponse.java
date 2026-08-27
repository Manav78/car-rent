package com.carrental.owner.dto;

import com.carrental.auth.enums.Role;
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
public class OwnerResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Role role;
    private Boolean willingToDrive;
    private String drivingLicenseNumber;
    private LocalDate licenseExpiryDate;
    private String companyName;
    private String taxNumber;
    private boolean verified;
    private boolean emailVerified;
    private LocalDateTime createdAt;
}
