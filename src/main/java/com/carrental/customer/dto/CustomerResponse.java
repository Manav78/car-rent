package com.carrental.customer.dto;

import com.carrental.auth.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Role role;
    private String address;
    private String city;
    private String postalCode;
    private boolean emailVerified;
    private LocalDateTime createdAt;
}
