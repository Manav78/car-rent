package com.carrental.driver.dto.request;

import com.carrental.driver.enums.DriverStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverStatusUpdateRequest {

    @NotNull(message = "Driver status is required")
    private DriverStatus status;

    private String inactiveReason;

    public DriverStatusUpdateRequest(DriverStatus status) {
        this.status = status;
    }

    public String getInactiveReason() {
        return inactiveReason;
    }
}


