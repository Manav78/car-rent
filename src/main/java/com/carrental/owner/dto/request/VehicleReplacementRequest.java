package com.carrental.owner.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleReplacementRequest {

    private Long vehicleId;
    private Long newVehicleId;
    private String reason;

    public Long getEffectiveVehicleId() {
        return newVehicleId != null ? newVehicleId : vehicleId;
    }
}
