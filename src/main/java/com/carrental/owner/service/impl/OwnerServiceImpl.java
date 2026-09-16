package com.carrental.owner.service.impl;

import com.carrental.owner.service.OwnerService;

import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.auth.entity.User;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.owner.dto.response.OwnerResponse;
import com.carrental.owner.dto.request.OwnerUpdateRequest;
import com.carrental.owner.entity.OwnerProfile;
import com.carrental.owner.enums.OwnerStatus;
import com.carrental.owner.repository.OwnerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OwnerServiceImpl implements OwnerService {

    private final UserRepository userRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final DriverProfileRepository driverProfileRepository;

    @Override
    @Transactional(readOnly = true)
    public OwnerResponse getOwnerProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        OwnerProfile profile = ownerProfileRepository.findByUserId(userId)
                .orElse(null);

        DriverProfile driverProfile = driverProfileRepository.findByUserId(userId)
                .orElse(null);

        return mapToResponse(user, profile, driverProfile);
    }

    @Override
    @Transactional
    public OwnerResponse updateOwnerProfile(Long userId, OwnerUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName().trim());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }

        userRepository.save(user);

        OwnerProfile profile = ownerProfileRepository.findByUserId(userId)
                .orElseGet(() -> OwnerProfile.builder().user(user).status(OwnerStatus.PENDING).build());

        OwnerProfile savedProfile = ownerProfileRepository.save(profile);

        DriverProfile driverProfile = driverProfileRepository.findByUserId(userId).orElse(null);
        if (Boolean.TRUE.equals(request.getWillingToDrive())) {
            if (driverProfile == null) {
                driverProfile = DriverProfile.builder()
                        .user(user)
                        .approvalStatus(ApprovalDecision.PENDING)
                        .status(DriverStatus.INACTIVE)
                        .inactiveReason("Pending Super Admin approval")
                        .build();
            }
            if (request.getDrivingLicenseNumber() != null) {
                driverProfile.setDrivingLicenseNumber(request.getDrivingLicenseNumber().trim());
            }
            if (request.getLicenseExpiryDate() != null) {
                driverProfile.setLicenseExpiryDate(request.getLicenseExpiryDate());
            }
            driverProfile = driverProfileRepository.save(driverProfile);
        } else if (Boolean.FALSE.equals(request.getWillingToDrive()) && driverProfile != null) {
            driverProfileRepository.delete(driverProfile);
            driverProfile = null;
        }

        log.info("Updated owner profile for user id: {}", userId);
        return mapToResponse(user, savedProfile, driverProfile);
    }

    private OwnerResponse mapToResponse(User user, OwnerProfile profile, DriverProfile driverProfile) {
        return OwnerResponse.builder()
                .id(profile != null ? profile.getId() : null)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(profile != null ? profile.getStatus() : OwnerStatus.PENDING)
                .rejectionReason(profile != null ? profile.getRejectionReason() : null)
                .willingToDrive(driverProfile != null)
                .drivingLicenseNumber(driverProfile != null ? driverProfile.getDrivingLicenseNumber() : null)
                .licenseExpiryDate(driverProfile != null ? driverProfile.getLicenseExpiryDate() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}

