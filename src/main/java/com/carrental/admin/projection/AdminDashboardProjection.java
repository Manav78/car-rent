package com.carrental.admin.projection;

public interface AdminDashboardProjection {
    Long getTotalOwners();
    Long getTotalCustomers();
    Long getTotalVehicles();
    Long getTotalDrivers();
    Long getPendingVehicleApprovals();
    Long getPendingDriverApprovals();
    Long getPendingOwnerDriverApprovals();
    Long getTotalPendingApprovals();
    Long getActiveVehicles();
    Long getInactiveVehicles();
    Long getDeletedAccounts();
}

