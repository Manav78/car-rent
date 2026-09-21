package com.carrental.driver.service.impl;

import com.carrental.driver.service.DriverService;

import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.auth.entity.User;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.BadRequestException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.driver.dto.request.DriverRequest;
import com.carrental.driver.dto.response.DriverResponse;
import com.carrental.driver.dto.request.DriverStatusUpdateRequest;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.auth.enums.Role;
import com.carrental.driver.dto.request.CreateDriverRequest;
import com.carrental.owner.entity.OwnerDriverUsageHistory;
import com.carrental.owner.repository.OwnerDriverUsageHistoryRepository;
import com.carrental.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final OwnerDriverUsageHistoryRepository ownerDriverUsageHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

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
                .orElseGet(() -> DriverProfile.builder()
                        .user(user)
                        .approvalStatus(ApprovalDecision.PENDING)
                        .status(DriverStatus.INACTIVE)
                        .build());

        if (request.getLicenseNumber() != null) {
            profile.setDrivingLicenseNumber(request.getLicenseNumber().trim());
        }
        if (request.getLicenseExpiryDate() != null) {
            profile.setLicenseExpiryDate(request.getLicenseExpiryDate());
        }
        if (request.getStatus() != null) {
            if (request.getStatus() == DriverStatus.INACTIVE && (request.getInactiveReason() == null || request.getInactiveReason().trim().isEmpty())) {
                throw new BadRequestException("Inactive reason is mandatory when setting driver status to INACTIVE");
            }
            if (request.getStatus() == DriverStatus.ACTIVE && profile.getApprovalStatus() != ApprovalDecision.APPROVED) {
                throw new BadRequestException("Driver cannot be set to ACTIVE until approved by admin");
            }
            profile.setStatus(request.getStatus());
            if (request.getStatus() == DriverStatus.INACTIVE) {
                profile.setInactiveReason(request.getInactiveReason().trim());
            } else {
                profile.setInactiveReason(null);
            }
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

        if (request == null || request.getStatus() == null) {
            throw new BadRequestException("Driver status is required");
        }

        if (request.getStatus() == DriverStatus.ACTIVE) {
            if (profile.getApprovalStatus() != ApprovalDecision.APPROVED) {
                throw new BadRequestException("Driver cannot be set to ACTIVE until approved by admin");
            }
        }

        if (request.getStatus() == DriverStatus.INACTIVE) {
            if (request.getInactiveReason() == null || request.getInactiveReason().trim().isEmpty()) {
                throw new BadRequestException("Inactive reason is mandatory when setting driver status to INACTIVE");
            }
            profile.setInactiveReason(request.getInactiveReason().trim());
        } else {
            profile.setInactiveReason(null);
        }

        profile.setStatus(request.getStatus());
        DriverProfile saved = driverProfileRepository.save(profile);
        log.info("Driver status updated to {} for user id: {}", request.getStatus(), userId);

        return mapToResponse(user, saved);
    }

    @Override
    @Transactional
    public DriverResponse createDriverForOwner(Long ownerId, CreateDriverRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner", "id", ownerId));

        boolean isOwner = (owner.getRoles() != null && owner.getRoles().contains(Role.OWNER))
                || owner.getRole() == Role.OWNER;
        if (!isOwner) {
            throw new BadRequestException("Only registered owners can add drivers to their fleet");
        }

        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        if (userRepository.existsByMobile(request.getPhoneNumber().trim())) {
            throw new BadRequestException("Phone number already registered: " + request.getPhoneNumber());
        }

        if (driverProfileRepository.existsByLicenseNumber(request.getLicenseNumber().trim())) {
            throw new BadRequestException("Driving license number already registered: " + request.getLicenseNumber());
        }

        if (request.getLicenseExpiryDate() != null && request.getLicenseExpiryDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("License expiry date must be in the future");
        }

        User driverUser = User.builder()
                .name(request.getResolvedName())
                .email(request.getEmail().trim().toLowerCase())
                .mobile(request.getPhoneNumber().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.DRIVER)
                .emailVerified(false)
                .isActive(true)
                .build();
        User savedDriver = userRepository.save(driverUser);

        DriverProfile driverProfile = DriverProfile.builder()
                .user(savedDriver)
                .addedByOwner(owner)
                .licenseNumber(request.getLicenseNumber().trim())
                .licenseExpiryDate(request.getLicenseExpiryDate())
                .status(DriverStatus.INACTIVE)
                .approvalStatus(ApprovalDecision.PENDING)
                .inactiveReason("Pending Super Admin approval")
                .build();
        DriverProfile savedProfile = driverProfileRepository.save(driverProfile);

        authService.sendVerificationOtp(savedDriver);

        log.info("Owner {} successfully created driver account {} with license {}", ownerId, savedDriver.getEmail(), savedProfile.getLicenseNumber());
        return mapToResponse(savedDriver, savedProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverResponse> getAvailableDrivers() {
        return getAvailableDrivers(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverResponse> getAvailableDrivers(Long ownerId) {
        LocalDate today = LocalDate.now();

        List<DriverProfile> allActiveApproved = driverProfileRepository.findByApprovalStatusAndStatus(ApprovalDecision.APPROVED, DriverStatus.ACTIVE)
                .stream()
                .filter(dp -> dp.getLicenseExpiryDate() == null || !dp.getLicenseExpiryDate().isBefore(today))
                .filter(dp -> dp.getUser() != null && Boolean.TRUE.equals(dp.getUser().getIsActive()) && dp.getUser().getDeletedAt() == null)
                .filter(dp -> {
                    boolean isOwnerDriver = dp.getUser() != null && (
                            (dp.getUser().getRoles() != null && dp.getUser().getRoles().contains(Role.OWNER))
                            || dp.getUser().getRole() == Role.OWNER
                    );
                    if (isOwnerDriver) {
                        return ownerId != null && dp.getUser().getId().equals(ownerId);
                    }
                    return true;
                })
                .toList();

        if (ownerId == null) {
            return allActiveApproved.stream().map(dp -> mapToResponse(dp.getUser(), dp)).toList();
        }

        List<DriverProfile> tier1 = allActiveApproved.stream()
                .filter(dp -> dp.getAddedByOwner() != null && dp.getAddedByOwner().getId().equals(ownerId))
                .sorted((a, b) -> {
                    LocalDateTime at = a.getCreatedAt() != null ? a.getCreatedAt() : LocalDateTime.MIN;
                    LocalDateTime bt = b.getCreatedAt() != null ? b.getCreatedAt() : LocalDateTime.MIN;
                    return bt.compareTo(at);
                })
                .toList();

        Set<Long> tier1ProfileIds = tier1.stream().map(DriverProfile::getId).collect(Collectors.toSet());

        List<OwnerDriverUsageHistory> history = ownerDriverUsageHistoryRepository.findByOwnerIdOrderByLastUsedAtDesc(ownerId);
        List<Long> previouslyUsedProfileIds = history.stream()
                .map(h -> h.getDriver().getId())
                .distinct()
                .filter(id -> !tier1ProfileIds.contains(id))
                .toList();

        Map<Long, DriverProfile> candidateMap = allActiveApproved.stream()
                .collect(Collectors.toMap(DriverProfile::getId, Function.identity(), (p1, p2) -> p1));

        List<DriverProfile> tier2 = new ArrayList<>();
        Set<Long> tier2ProfileIds = new HashSet<>();
        for (Long pid : previouslyUsedProfileIds) {
            DriverProfile dp = candidateMap.get(pid);
            if (dp != null) {
                tier2.add(dp);
                tier2ProfileIds.add(dp.getId());
            }
        }

        List<DriverProfile> tier3 = allActiveApproved.stream()
                .filter(dp -> !tier1ProfileIds.contains(dp.getId()) && !tier2ProfileIds.contains(dp.getId()))
                .sorted((a, b) -> {
                    LocalDateTime at = a.getCreatedAt() != null ? a.getCreatedAt() : LocalDateTime.MIN;
                    LocalDateTime bt = b.getCreatedAt() != null ? b.getCreatedAt() : LocalDateTime.MIN;
                    return bt.compareTo(at);
                })
                .toList();

        List<DriverProfile> sortedDrivers = new ArrayList<>(tier1.size() + tier2.size() + tier3.size());
        sortedDrivers.addAll(tier1);
        sortedDrivers.addAll(tier2);
        sortedDrivers.addAll(tier3);

        return sortedDrivers.stream().map(dp -> mapToResponse(dp.getUser(), dp)).toList();
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
                .emailVerified(user.getEmailVerified())
                .drivingLicenseNumber(profile != null ? profile.getDrivingLicenseNumber() : null)
                .licenseExpiryDate(profile != null ? profile.getLicenseExpiryDate() : null)
                .approvalStatus(profile != null ? profile.getApprovalStatus() : null)
                .status(profile != null && profile.getStatus() != null ? profile.getStatus() : DriverStatus.INACTIVE)
                .inactiveReason(profile != null ? profile.getInactiveReason() : null)
                .rejectionReason(profile != null ? (profile.getRejectionReason() != null ? profile.getRejectionReason() : profile.getInactiveReason()) : null)
                .createdAt(profile != null && profile.getCreatedAt() != null ? profile.getCreatedAt() : user.getCreatedAt())
                .build();
    }
}

