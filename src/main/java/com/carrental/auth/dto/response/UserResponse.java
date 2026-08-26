package com.carrental.auth.dto.response;

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
public class UserResponse {

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
    private boolean emailVerified;
    private boolean enabled;
    private LocalDateTime createdAt;
}
