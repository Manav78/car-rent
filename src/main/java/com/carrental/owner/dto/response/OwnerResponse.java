package com.carrental.owner.dto.response;

import com.carrental.auth.enums.Role;
import com.carrental.owner.enums.OwnerStatus;
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
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Role role;
    private OwnerStatus status;
    private Boolean willingToDrive;
    private String drivingLicenseNumber;
    private LocalDate licenseExpiryDate;
    private LocalDateTime createdAt;
}


