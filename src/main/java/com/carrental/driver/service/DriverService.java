package com.carrental.driver.service;

import com.carrental.driver.dto.DriverRequest;
import com.carrental.driver.dto.DriverResponse;
import com.carrental.driver.dto.DriverStatusUpdateRequest;
import com.carrental.driver.enums.DriverStatus;

import java.util.List;

public interface DriverService {

    DriverResponse getDriverProfile(Long userId);

    DriverResponse updateDriverProfile(Long userId, DriverRequest request);

    DriverResponse updateStatus(Long userId, DriverStatusUpdateRequest request);

    List<DriverResponse> getAvailableDrivers();
}
