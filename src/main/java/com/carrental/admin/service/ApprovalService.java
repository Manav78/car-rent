package com.carrental.admin.service;

import com.carrental.admin.dto.request.*;
import com.carrental.admin.dto.response.*;
import com.carrental.security.service.UserDetailsImpl;
import org.springframework.data.domain.Pageable;

public interface ApprovalService {
    PageResponse<PendingVehicleResponse> getPendingVehicles(Pageable pageable);
    AdminVehicleDetailResponse getVehicleDetail(Long vehicleId);
    void decideVehicleApproval(Long vehicleId, ApprovalDecisionRequest request, UserDetailsImpl userPrincipal);

    PageResponse<PendingDriverResponse> getPendingDrivers(Pageable pageable);
    AdminDriverDetailResponse getDriverDetail(Long driverId);
    void decideDriverApproval(Long driverId, ApprovalDecisionRequest request, UserDetailsImpl userPrincipal);

    PageResponse<PendingOwnerDriverResponse> getPendingOwnerDrivers(Pageable pageable);
    AdminOwnerDriverDetailResponse getOwnerDriverDetail(Long driverProfileId);
    void decideOwnerDriverApproval(Long driverProfileId, ApprovalDecisionRequest request, UserDetailsImpl principal);
}

