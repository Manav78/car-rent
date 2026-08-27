package com.carrental.owner.service;

import com.carrental.auth.entity.User;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.owner.dto.OwnerResponse;
import com.carrental.owner.dto.OwnerUpdateRequest;
import com.carrental.owner.entity.OwnerProfile;
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

    @Override
    @Transactional(readOnly = true)
    public OwnerResponse getOwnerProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        OwnerProfile profile = ownerProfileRepository.findByUserId(userId)
                .orElse(null);

        return mapToResponse(user, profile);
    }

    @Override
    @Transactional
    public OwnerResponse updateOwnerProfile(Long userId, OwnerUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getWillingToDrive() != null) user.setWillingToDrive(request.getWillingToDrive());
        if (request.getDrivingLicenseNumber() != null) user.setDrivingLicenseNumber(request.getDrivingLicenseNumber());
        if (request.getLicenseExpiryDate() != null) user.setLicenseExpiryDate(request.getLicenseExpiryDate());

        userRepository.save(user);

        OwnerProfile profile = ownerProfileRepository.findByUserId(userId)
                .orElseGet(() -> OwnerProfile.builder().user(user).build());

        if (request.getCompanyName() != null) profile.setCompanyName(request.getCompanyName());
        if (request.getTaxNumber() != null) profile.setTaxNumber(request.getTaxNumber());

        OwnerProfile savedProfile = ownerProfileRepository.save(profile);
        log.info("Updated owner profile for user id: {}", userId);

        return mapToResponse(user, savedProfile);
    }

    private OwnerResponse mapToResponse(User user, OwnerProfile profile) {
        return OwnerResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .willingToDrive(user.getWillingToDrive())
                .drivingLicenseNumber(user.getDrivingLicenseNumber())
                .licenseExpiryDate(user.getLicenseExpiryDate())
                .companyName(profile != null ? profile.getCompanyName() : null)
                .taxNumber(profile != null ? profile.getTaxNumber() : null)
                .verified(profile != null && profile.isVerified())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
