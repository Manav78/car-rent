package com.carrental.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsResponse {
    private long totalUsers;
    private long totalCustomers;
    private long totalOwners;
    private long totalDrivers;
    private long totalVehicles;
    private long totalBookings;
    private long activeBookings;
    private BigDecimal totalRevenue;
    private Map<String, Long> userCountByRole;
}


