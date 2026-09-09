package com.carrental.admin.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserStatusUpdateRequest {

    private Boolean enabled;
    private Boolean isActive;
    private Boolean emailVerified;
    private Boolean accountNonLocked;

    public AdminUserStatusUpdateRequest(Boolean enabled) {
        this.enabled = enabled;
        this.isActive = enabled;
        this.accountNonLocked = true;
    }

    public AdminUserStatusUpdateRequest(Boolean enabled, Boolean accountNonLocked) {
        this.enabled = enabled;
        this.isActive = enabled;
        this.accountNonLocked = accountNonLocked;
    }
}


