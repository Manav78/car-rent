package com.carrental.owner.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverReplacementRequest {

    private Long driverId;
    private Long newDriverId;
    private String reason;

    public Long getEffectiveDriverId() {
        return newDriverId != null ? newDriverId : driverId;
    }
}
