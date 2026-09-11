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
        Page<Vehicle> vehiclePage = vehicleRepository.findAllByStatusWithOwner(VehicleStatus.PENDING, pageable);

        Page<PendingVehicleResponse> responsePage = vehiclePage.map(vehicle -> {
            OwnerProfile ownerProfile = ownerProfileRepository.findByUserId(vehicle.getOwner().getId()).orElse(null);
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
                    vehicle.getOwner().getId(),
                    vehicle.getOwner().getFullName(),
                    vehicle.getOwner().getEmail(),
                    vehicle.getOwner().getPhoneNumber(),

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

        OwnerProfile ownerProfile = ownerProfileRepository.findByUserId(vehicle.getOwner().getId()).orElse(null);

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

        List<ApprovalRecordResponse> history = mapApprovalHistory(ApprovalEntityType.VEHICLE, vehicleId);

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
                vehicle.getStatus() != null ? vehicle.getStatus().name() : "PENDING",
                vehicle.getStatus() == VehicleStatus.AVAILABLE ? "ACTIVE" : "INACTIVE",
                null,

                ownerProfile != null ? ownerProfile.getId() : null,
                vehicle.getOwner().getFullName(),
                vehicle.getOwner().getEmail(),
                vehicle.getOwner().getPhoneNumber(),
                null,

                documents,
                history,
                vehicle.getCreatedAt()
        );
    }

    @Transactional
    public void decideVehicleApproval(Long vehicleId, ApprovalDecisionRequest request, UserDetailsImpl userPrincipal) {
        validateReasonForRejection(request);

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Vehicle not found"
                ));

        if (vehicle.getStatus() != VehicleStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only vehicles pending approval can be reviewed"
            );
        }

        User admin = getAdminUser(userPrincipal.getId());

        if (request.decision() == ApprovalDecision.APPROVED) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicle.setApprovalStatus("APPROVED");
            vehicle.setApprovedAt(java.time.LocalDateTime.now());
        } else {
            vehicle.setStatus(VehicleStatus.REJECTED);
            vehicle.setApprovalStatus("REJECTED");
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
    }

    @Transactional(readOnly = true)
    public PageResponse<PendingDriverResponse> getPendingDrivers(Pageable pageable) {
        Page<DriverProfile> driverPage = driverProfileRepository.findAllByStatusWithDetails(DriverStatus.PENDING, pageable);

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

        OwnerProfile ownerProfile = ownerProfileRepository.findByUserId(driver.getUser().getId()).orElse(null);

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

        List<ApprovalRecordResponse> history = mapApprovalHistory(ApprovalEntityType.DRIVER, driverId);

        return new AdminDriverDetailResponse(
                driver.getId(),
                driver.getUser().getId(),
                driver.getUser().getFullName(),
                driver.getUser().getEmail(),
                driver.getUser().getPhoneNumber(),
                null,
                driver.getDrivingLicenseNumber(),
                driver.getLicenseExpiryDate(),
                driver.getStatus() != null ? driver.getStatus().name() : "PENDING",
                driver.getStatus() == DriverStatus.AVAILABLE ? "ACTIVE" : "INACTIVE",
                null,

                ownerProfile != null ? ownerProfile.getId() : null,
                ownerProfile != null ? driver.getUser().getFullName() : null,
                ownerProfile != null ? driver.getUser().getEmail() : null,

                documents,
                history,
                driver.getCreatedAt()
        );
    }

    @Transactional
    public void decideDriverApproval(Long driverId, ApprovalDecisionRequest request, UserDetailsImpl userPrincipal) {
        validateReasonForRejection(request);

        DriverProfile driver = driverProfileRepository.findByIdWithDetails(driverId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Driver not found"
                ));

        if (driver.getUser() != null && (driver.getUser().getRole() == Role.OWNER || driver.getUser().getRole() == Role.ROLE_OWNER)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This is an Owner-as-Driver application. Review it via /approvals/owner-drivers/{id}"
            );
        }

        if (driver.getStatus() != DriverStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only drivers pending approval can be reviewed"
            );
        }

        User admin = getAdminUser(userPrincipal.getId());

        if (request.decision() == ApprovalDecision.APPROVED) {
            driver.setStatus(DriverStatus.APPROVED);
        } else {
            driver.setStatus(DriverStatus.REJECTED);
        }

        driverProfileRepository.save(driver);

        approvalRepository.save(new Approval(
                admin,
                ApprovalEntityType.DRIVER,
                driver.getId(),
                request.decision(),
                request.reason()
        ));
    }

    @Transactional(readOnly = true)
    public PageResponse<PendingOwnerDriverResponse> getPendingOwnerDrivers(Pageable pageable) {
        Page<DriverProfile> page = driverProfileRepository.findPendingOwnerDrivers(DriverStatus.PENDING, pageable);
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

        List<DocumentResponse> docs = new ArrayList<>();
        if (dp.getDrivingLicenseNumber() != null) {
            docs.add(new DocumentResponse(1L, "LICENSE", dp.getDrivingLicenseNumber(), null, dp.getCreatedAt()));
        }

        List<ApprovalRecordResponse> history = mapApprovalHistory(ApprovalEntityType.DRIVER, driverProfileId);

        return new AdminOwnerDriverDetailResponse(
                dp.getId(),
                dp.getUser().getId(),
                dp.getUser().getFullName(),
                dp.getUser().getEmail(),
                dp.getUser().getPhoneNumber(),
                dp.getUser().getFullName() + "'s Fleet",
                dp.getDrivingLicenseNumber(),
                dp.getLicenseExpiryDate(),
                dp.getStatus() != null ? dp.getStatus().name() : "PENDING",
                null,
                docs,
                history,
                dp.getCreatedAt()
        );
    }

    @Transactional
    public void decideOwnerDriverApproval(Long driverProfileId, ApprovalDecisionRequest request, UserDetailsImpl principal) {
        validateReasonForRejection(request);

        DriverProfile dp = driverProfileRepository.findOwnerDriverById(driverProfileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner-Driver application not found"));

        if (dp.getStatus() != DriverStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Application is not pending.");
        }

        User admin = getAdminUser(principal.getId());

        if (request.decision() == ApprovalDecision.APPROVED) {
            dp.setStatus(DriverStatus.APPROVED);
        } else {
            dp.setStatus(DriverStatus.REJECTED);
        }

        driverProfileRepository.save(dp);

        approvalRepository.save(new Approval(admin, ApprovalEntityType.DRIVER, dp.getId(), request.decision(), request.reason()));
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

