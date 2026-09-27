package com.carrental.auth.dto.response;

import com.carrental.auth.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Set<Role> roles;
    private Boolean emailVerified;
    private Boolean isActive;
    private boolean enabled;
    private LocalDateTime createdAt;

    public boolean isEmailVerified() {
        return Boolean.TRUE.equals(emailVerified);
    }

    public boolean isEnabled() {
        return enabled || (Boolean.TRUE.equals(emailVerified) && (isActive == null || isActive));
    }
}

