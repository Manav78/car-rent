package com.carrental.driver.service;

import com.carrental.driver.dto.request.DriverRequest;
import com.carrental.driver.dto.response.DriverResponse;
import com.carrental.driver.dto.request.DriverStatusUpdateRequest;
import com.carrental.driver.enums.DriverStatus;

import java.util.List;

public interface DriverService {

    DriverResponse getDriverProfile(Long userId);

    DriverResponse updateDriverProfile(Long userId, DriverRequest request);

    DriverResponse updateStatus(Long userId, DriverStatusUpdateRequest request);

    DriverResponse createDriverForOwner(Long ownerId, com.carrental.driver.dto.request.CreateDriverRequest request);

    List<DriverResponse> getAvailableDrivers();

    List<DriverResponse> getAvailableDrivers(Long ownerId);
}

