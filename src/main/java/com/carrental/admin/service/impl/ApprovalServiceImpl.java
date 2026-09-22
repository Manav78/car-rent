package com.carrental.admin.service.impl;

import com.carrental.admin.service.ApprovalService;
import com.carrental.admin.dto.request.*;
import com.carrental.admin.dto.response.*;
import com.carrental.admin.entity.Approval;
import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.admin.enums.ApprovalEntityType;
import com.carrental.admin.repository.ApprovalRepository;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.owner.entity.OwnerProfile;
import com.carrental.owner.repository.OwnerProfileRepository;
import com.carrental.security.service.UserDetailsImpl;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApprovalServiceImpl implements ApprovalService {

    private final VehicleRepository vehicleRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final UserRepository userRepository;
    private final ApprovalRepository approvalRepository;

    @Transactional(readOnly = true)
    public PageResponse<PendingVehicleResponse> getPendingVehicles(Pageable pageable) {
        Page<Vehicle> vehiclePage = vehicleRepository.findAllByApprovalStatusWithOwner(ApprovalDecision.PENDING, pageable);

        Page<PendingVehicleResponse> responsePage = vehiclePage.map(vehicle -> {
            OwnerProfile ownerProfile = vehicle.getOwner();
            User ownerUser = ownerProfile != null ? ownerProfile.getUser() : null;
            return new PendingVehicleResponse(
                    vehicle.getId(),
                    (vehicle.getBrand() != null ? vehicle.getBrand() : "") + " " + (vehicle.getModel() != null ? vehicle.getModel() : ""),
                    vehicle.getLicensePlate(),
                    vehicle.getBrand(),
                    vehicle.getModel(),
                    vehicle.getVehicleType() != null ? vehicle.getVehicleType().name() : null,
                    vehicle.getYear(),
                    vehicle.getSeatingCapacity(),
                    vehicle.getFuelType() != null ? vehicle.getFuelType().name() : null,
                    vehicle.getCreatedAt() != null ? vehicle.getCreatedAt().toLocalDate() : LocalDate.now(),
                    vehicle.getPricePerKm() != null ? BigDecimal.valueOf(vehicle.getPricePerKm()) : BigDecimal.ZERO,
                    null,
                    vehicle.getLocation(),
                    vehicle.getDescription(),

                    ownerProfile != null ? ownerProfile.getId() : null,
                    ownerUser != null ? ownerUser.getId() : null,
                    ownerUser != null ? ownerUser.getFullName() : null,
                    ownerUser != null ? ownerUser.getEmail() : null,
                    ownerUser != null ? ownerUser.getPhoneNumber() : null,

                    vehicle.getCreatedAt()
            );
        });
        return PageResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public AdminVehicleDetailResponse getVehicleDetail(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findByIdWithOwner(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Vehicle not found"
                ));
        return toVehicleDetailResponse(vehicle);
    }

    private AdminVehicleDetailResponse toVehicleDetailResponse(Vehicle vehicle) {
        OwnerProfile ownerProfile = vehicle.getOwner();
        User ownerUser = ownerProfile != null ? ownerProfile.getUser() : null;

        List<DocumentResponse> documents = new ArrayList<>();
        if (vehicle.getImageUrls() != null) {
            long docId = 1L;
            for (String url : vehicle.getImageUrls()) {
                documents.add(new DocumentResponse(
                        docId,
                        "PHOTO",
                        url,
                        docId == 1L,
                        vehicle.getCreatedAt()
                ));
                docId++;
            }
        }

        List<ApprovalRecordResponse> history = mapApprovalHistory(ApprovalEntityType.VEHICLE, vehicle.getId());

        return new AdminVehicleDetailResponse(
                vehicle.getId(),
                (vehicle.getBrand() != null ? vehicle.getBrand() : "") + " " + (vehicle.getModel() != null ? vehicle.getModel() : ""),
                vehicle.getLicensePlate(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getVehicleType() != null ? vehicle.getVehicleType().name() : null,
                vehicle.getYear(),
                vehicle.getSeatingCapacity(),
                vehicle.getFuelType() != null ? vehicle.getFuelType().name() : null,
                vehicle.getCreatedAt() != null ? vehicle.getCreatedAt().toLocalDate() : LocalDate.now(),
                vehicle.getPricePerKm() != null ? BigDecimal.valueOf(vehicle.getPricePerKm()) : BigDecimal.ZERO,
                null,
                vehicle.getLocation(),
                vehicle.getDescription(),
                vehicle.getApprovalStatus() != null ? vehicle.getApprovalStatus().name() : "PENDING",
                vehicle.getStatus() != null ? vehicle.getStatus().name() : "INACTIVE",
                vehicle.getRejectionReason(),

                ownerProfile != null ? ownerProfile.getId() : null,
                ownerUser != null ? ownerUser.getFullName() : null,
                ownerUser != null ? ownerUser.getEmail() : null,
                ownerUser != null ? ownerUser.getPhoneNumber() : null,
                null,

                documents,
                history,
                vehicle.getCreatedAt()
        );
    }

    @Transactional
    public AdminVehicleDetailResponse decideVehicleApproval(Long vehicleId, ApprovalDecisionRequest request, UserDetailsImpl userPrincipal) {
        validateReasonForRejection(request);

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Vehicle not found"
                ));

        if (vehicle.getApprovalStatus() != ApprovalDecision.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only vehicles pending approval can be reviewed"
            );
        }

        User admin = getAdminUser(userPrincipal.getId());

        if (request.decision() == ApprovalDecision.APPROVED) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicle.setApprovalStatus(ApprovalDecision.APPROVED);
            vehicle.setApprovedAt(java.time.LocalDateTime.now());
            vehicle.setRejectionReason(null);
        } else {
            vehicle.setStatus(VehicleStatus.INACTIVE);
            vehicle.setApprovalStatus(ApprovalDecision.REJECTED);
            vehicle.setRejectionReason(request.reason());
        }

        vehicleRepository.save(vehicle);

        approvalRepository.save(new Approval(
                admin,
                ApprovalEntityType.VEHICLE,
                vehicle.getId(),
                request.decision(),
                request.reason()
        ));

        return toVehicleDetailResponse(vehicle);
    }

    @Transactional(readOnly = true)
    public PageResponse<PendingDriverResponse> getPendingDrivers(Pageable pageable) {
        Page<DriverProfile> driverPage = driverProfileRepository.findAllByApprovalStatusWithDetails(ApprovalDecision.PENDING, pageable);

        Page<PendingDriverResponse> responsePage = driverPage.map(driver -> {
            OwnerProfile ownerProfile = ownerProfileRepository.findByUserId(driver.getUser().getId()).orElse(null);
            return new PendingDriverResponse(
                    driver.getId(),
                    driver.getUser().getId(),
                    driver.getUser().getFullName(),
                    driver.getUser().getEmail(),
                    driver.getUser().getPhoneNumber(),
                    driver.getDrivingLicenseNumber(),
                    driver.getLicenseExpiryDate(),

                    ownerProfile != null ? ownerProfile.getId() : null,
                    ownerProfile != null ? driver.getUser().getFullName() : null,
                    ownerProfile != null ? driver.getUser().getEmail() : null,

                    driver.getCreatedAt()
            );
        });
        return PageResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public AdminDriverDetailResponse getDriverDetail(Long driverId) {
        DriverProfile driver = driverProfileRepository.findByIdWithDetails(driverId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Driver not found"
                ));
        return toDriverDetailResponse(driver);
    }

    private AdminDriverDetailResponse toDriverDetailResponse(DriverProfile driver) {
        OwnerProfile ownerProfile = driver.getUser() != null
                ? ownerProfileRepository.findByUserId(driver.getUser().getId()).orElse(null)
                : null;

        List<DocumentResponse> documents = new ArrayList<>();
        if (driver.getDrivingLicenseNumber() != null) {
            documents.add(new DocumentResponse(
                    1L,
                    "DRIVING_LICENSE",
                    driver.getDrivingLicenseNumber(),
                    null,
                    driver.getCreatedAt()
            ));
        }

        List<ApprovalRecordResponse> history = mapApprovalHistory(ApprovalEntityType.DRIVER, driver.getId());

        String rejectionReason = driver.getRejectionReason() != null ? driver.getRejectionReason() : driver.getInactiveReason();

        return new AdminDriverDetailResponse(
                driver.getId(),
                driver.getUser() != null ? driver.getUser().getId() : null,
                driver.getUser() != null ? driver.getUser().getFullName() : null,
                driver.getUser() != null ? driver.getUser().getEmail() : null,
                driver.getUser() != null ? driver.getUser().getPhoneNumber() : null,
                null,
                driver.getDrivingLicenseNumber(),
                driver.getLicenseExpiryDate(),
                driver.getApprovalStatus() != null ? driver.getApprovalStatus().name() : "PENDING",
                driver.getStatus() != null ? driver.getStatus().name() : "INACTIVE",
                rejectionReason,

                ownerProfile != null ? ownerProfile.getId() : null,
                ownerProfile != null && driver.getUser() != null ? driver.getUser().getFullName() : null,
                ownerProfile != null && driver.getUser() != null ? driver.getUser().getEmail() : null,

                documents,
                history,
                driver.getCreatedAt()
        );
    }

    @Transactional
    public AdminDriverDetailResponse decideDriverApproval(Long driverId, ApprovalDecisionRequest request, UserDetailsImpl userPrincipal) {
        validateReasonForRejection(request);

        DriverProfile driver = driverProfileRepository.findByIdWithDetails(driverId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Driver not found"
                ));

        boolean isOwner = driver.getUser() != null && ((driver.getUser().getRoles() != null && driver.getUser().getRoles().contains(Role.OWNER))
                || driver.getUser().getRole() == Role.OWNER);
        if (isOwner) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This is an Owner-as-Driver application. Review it via /approvals/owner-drivers/{id}"
            );
        }

        if (driver.getApprovalStatus() != ApprovalDecision.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only drivers pending approval can be reviewed"
            );
        }

        User admin = getAdminUser(userPrincipal.getId());

        if (request.decision() == ApprovalDecision.APPROVED) {
            driver.setApprovalStatus(ApprovalDecision.APPROVED);
            driver.setStatus(DriverStatus.ACTIVE);
            driver.setInactiveReason(null);
            driver.setRejectionReason(null);
            driver.setApprovedAt(java.time.LocalDateTime.now());
        } else {
            driver.setApprovalStatus(ApprovalDecision.REJECTED);
            driver.setStatus(DriverStatus.INACTIVE);
            driver.setInactiveReason(request.reason());
            driver.setRejectionReason(request.reason());
        }

        driverProfileRepository.save(driver);

        approvalRepository.save(new Approval(
                admin,
                ApprovalEntityType.DRIVER,
                driver.getId(),
                request.decision(),
                request.reason()
        ));

        return toDriverDetailResponse(driver);
    }

    @Transactional(readOnly = true)
    public PageResponse<PendingOwnerDriverResponse> getPendingOwnerDrivers(Pageable pageable) {
        Page<DriverProfile> page = driverProfileRepository.findPendingOwnerDrivers(ApprovalDecision.PENDING, pageable);
        Page<PendingOwnerDriverResponse> responsePage = page.map(dp -> {
            return new PendingOwnerDriverResponse(
                    dp.getId(),
                    dp.getUser().getId(),
                    dp.getUser().getFullName(),
                    dp.getUser().getEmail(),
                    dp.getUser().getPhoneNumber(),
                    dp.getUser().getFullName() + "'s Fleet",
                    dp.getDrivingLicenseNumber(),
                    dp.getLicenseExpiryDate(),
                    dp.getCreatedAt()
            );
        });
        return PageResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public AdminOwnerDriverDetailResponse getOwnerDriverDetail(Long driverProfileId) {
        DriverProfile dp = driverProfileRepository.findOwnerDriverById(driverProfileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner-Driver application not found"));
        return toOwnerDriverDetailResponse(dp);
    }

    private AdminOwnerDriverDetailResponse toOwnerDriverDetailResponse(DriverProfile dp) {
        List<DocumentResponse> docs = new ArrayList<>();
        if (dp.getDrivingLicenseNumber() != null) {
            docs.add(new DocumentResponse(1L, "LICENSE", dp.getDrivingLicenseNumber(), null, dp.getCreatedAt()));
        }

        List<ApprovalRecordResponse> history = mapApprovalHistory(ApprovalEntityType.DRIVER, dp.getId());

        String rejectionReason = dp.getRejectionReason() != null ? dp.getRejectionReason() : dp.getInactiveReason();

        return new AdminOwnerDriverDetailResponse(
                dp.getId(),
                dp.getUser() != null ? dp.getUser().getId() : null,
                dp.getUser() != null ? dp.getUser().getFullName() : null,
                dp.getUser() != null ? dp.getUser().getEmail() : null,
                dp.getUser() != null ? dp.getUser().getPhoneNumber() : null,
                dp.getUser() != null ? dp.getUser().getFullName() + "'s Fleet" : "Owner Fleet",
                dp.getDrivingLicenseNumber(),
                dp.getLicenseExpiryDate(),
                dp.getApprovalStatus() != null ? dp.getApprovalStatus().name() : "PENDING",
                rejectionReason,
                docs,
                history,
                dp.getCreatedAt()
        );
    }

    @Transactional
    public AdminOwnerDriverDetailResponse decideOwnerDriverApproval(Long driverProfileId, ApprovalDecisionRequest request, UserDetailsImpl principal) {
        validateReasonForRejection(request);

        DriverProfile dp = driverProfileRepository.findOwnerDriverById(driverProfileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner-Driver application not found"));

        if (dp.getApprovalStatus() != ApprovalDecision.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Application is not pending.");
        }

        User admin = getAdminUser(principal.getId());

        if (request.decision() == ApprovalDecision.APPROVED) {
            dp.setApprovalStatus(ApprovalDecision.APPROVED);
            dp.setStatus(DriverStatus.ACTIVE);
            dp.setInactiveReason(null);
            dp.setRejectionReason(null);
            dp.setApprovedAt(java.time.LocalDateTime.now());
            if (dp.getUser() != null) {
                dp.getUser().addRole(Role.DRIVER);
                userRepository.save(dp.getUser());
            }
        } else {
            dp.setApprovalStatus(ApprovalDecision.REJECTED);
            dp.setStatus(DriverStatus.INACTIVE);
            dp.setInactiveReason(request.reason());
            dp.setRejectionReason(request.reason());
        }

        driverProfileRepository.save(dp);

        approvalRepository.save(new Approval(admin, ApprovalEntityType.DRIVER, dp.getId(), request.decision(), request.reason()));

        return toOwnerDriverDetailResponse(dp);
    }

    private List<ApprovalRecordResponse> mapApprovalHistory(ApprovalEntityType entityType, Long entityId) {
        return approvalRepository.findHistoryWithAdmin(entityType, entityId)
                .stream()
                .map(a -> new ApprovalRecordResponse(
                        a.getDecision().name(),
                        a.getReason(),
                        a.getAdminUser().getFullName(),
                        a.getCreatedAt()
                ))
                .toList();
    }

    private User getAdminUser(Long adminUserId) {
        return userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Authenticated admin user no longer exists"
                ));
    }

    private void validateReasonForRejection(ApprovalDecisionRequest request) {
        if (request.decision() == ApprovalDecision.REJECTED && (request.reason() == null || request.reason().isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rejection reason is required when rejecting"
            );
        }
    }
}

