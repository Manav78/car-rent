package com.carrental.owner.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverAssignmentRequest {

    @NotNull(message = "Driver ID is required")
    private Long driverId;
}
