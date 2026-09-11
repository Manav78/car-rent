package com.carrental.driver.service.impl;

import com.carrental.driver.service.DriverService;

import com.carrental.auth.entity.User;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.driver.dto.request.DriverRequest;
import com.carrental.driver.dto.response.DriverResponse;
import com.carrental.driver.dto.request.DriverStatusUpdateRequest;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;

    @Override
    @Transactional(readOnly = true)
    public DriverResponse getDriverProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        DriverProfile profile = driverProfileRepository.findByUserId(userId)
                .orElse(null);

        return mapToResponse(user, profile);
    }

    @Override
    @Transactional
    public DriverResponse updateDriverProfile(Long userId, DriverRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        DriverProfile profile = driverProfileRepository.findByUserId(userId)
                .orElseGet(() -> DriverProfile.builder().user(user).status(DriverStatus.PENDING).build());

        if (request.getLicenseNumber() != null) {
            profile.setDrivingLicenseNumber(request.getLicenseNumber().trim());
        }
        if (request.getLicenseExpiryDate() != null) {
            profile.setLicenseExpiryDate(request.getLicenseExpiryDate());
        }
        if (request.getStatus() != null) {
            profile.setStatus(request.getStatus());
        }

        DriverProfile saved = driverProfileRepository.save(profile);
        log.info("Updated driver profile for user id: {}", userId);

        return mapToResponse(user, saved);
    }

    @Override
    @Transactional
    public DriverResponse updateStatus(Long userId, DriverStatusUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        DriverProfile profile = driverProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found for user: " + userId));

        profile.setStatus(request.getStatus());
        DriverProfile saved = driverProfileRepository.save(profile);
        log.info("Driver status updated to {} for user id: {}", request.getStatus(), userId);

        return mapToResponse(user, saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverResponse> getAvailableDrivers() {
        return driverProfileRepository.findByStatus(DriverStatus.AVAILABLE)
                .stream()
                .map(profile -> mapToResponse(profile.getUser(), profile))
                .toList();
    }

    private DriverResponse mapToResponse(User user, DriverProfile profile) {
        return DriverResponse.builder()
                .id(profile != null ? profile.getId() : null)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .drivingLicenseNumber(profile != null ? profile.getDrivingLicenseNumber() : null)
                .licenseExpiryDate(profile != null ? profile.getLicenseExpiryDate() : null)
                .status(profile != null && profile.getStatus() != null ? profile.getStatus() : DriverStatus.PENDING)
                .createdAt(profile != null && profile.getCreatedAt() != null ? profile.getCreatedAt() : user.getCreatedAt())
                .build();
    }
}

