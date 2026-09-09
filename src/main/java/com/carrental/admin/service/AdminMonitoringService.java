package com.carrental.admin.service;

import com.carrental.admin.dto.response.PageResponse;
import com.carrental.admin.dto.response.VehicleMonitoringResponse;
import com.carrental.vehicle.enums.VehicleStatus;
import org.springframework.data.domain.Pageable;

public interface AdminMonitoringService {
    PageResponse<VehicleMonitoringResponse> getVehicleMonitoring(
            String search,
            String operationalStatus,
            VehicleStatus approvalStatus,
            Pageable pageable
    );
}

