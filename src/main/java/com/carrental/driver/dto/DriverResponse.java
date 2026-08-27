package com.carrental.driver.dto;

import com.carrental.auth.enums.Role;
import com.carrental.driver.enums.DriverStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Role role;
    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private Integer yearsOfExperience;
    private DriverStatus status;
    private Double rating;
    private Integer totalTrips;
}
