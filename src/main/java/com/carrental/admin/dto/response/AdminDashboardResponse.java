package com.carrental.admin.dto.response;

public record AdminDashboardResponse(
        long totalOwners,
        long totalCustomers,
        long totalDrivers,
        long totalVehicles,
        long pendingVehicleApprovals,
        long pendingDriverApprovals,
        long pendingOwnerDriverApprovals,
        long totalPendingApprovals,
        long activeVehicles,
        long inactiveVehicles,
        long deletedAccounts
) {}


