package com.carrental.booking.service.impl;

import com.carrental.booking.service.BookingService;

import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.booking.dto.request.BookingRequest;
import com.carrental.booking.dto.request.BookingStatusUpdateRequest;
import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.entity.Booking;
import com.carrental.booking.entity.Trip;
import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.mapper.BookingMapper;
import com.carrental.booking.repository.BookingRepository;
import com.carrental.booking.repository.TripRepository;
import com.carrental.common.exception.BadRequestException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.customer.entity.CustomerProfile;
import com.carrental.customer.repository.CustomerProfileRepository;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.notification.enums.NotificationType;
import com.carrental.notification.service.EmailService;
import com.carrental.notification.service.NotificationService;
import com.carrental.owner.dto.request.DriverReplacementRequest;
import com.carrental.owner.dto.request.VehicleReplacementRequest;
import com.carrental.owner.entity.OwnerDriverUsageHistory;
import com.carrental.owner.entity.OwnerProfile;
import com.carrental.owner.repository.OwnerDriverUsageHistoryRepository;
import com.carrental.owner.repository.OwnerProfileRepository;
import com.carrental.security.service.UserDetailsImpl;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final OwnerDriverUsageHistoryRepository ownerDriverUsageHistoryRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final BookingMapper bookingMapper;
    private final TripRepository tripRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(Long customerId, BookingRequest request) {
        CustomerProfile customerProfile = customerProfileRepository.findByUserId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for user: " + customerId));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", request.getVehicleId()));

        if (vehicle.getApprovalStatus() != ApprovalDecision.APPROVED || vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new BadRequestException("Vehicle is not approved or currently not available for booking");
        }

        if (request.getPassengerCount() != null && request.getPassengerCount() > vehicle.getSeatingCapacity()) {
            throw new BadRequestException("Passenger count (" + request.getPassengerCount() +
                    ") exceeds vehicle seating capacity (" + vehicle.getSeatingCapacity() + ")");
        }

        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Start date cannot be in the past");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        if (bookingRepository.existsConflictingBooking(vehicle.getId(), request.getStartDate(), request.getEndDate())) {
            throw new BadRequestException("Vehicle is already booked for the selected date range");
        }

        String bookingReference = "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Booking booking = Booking.builder()
                .bookingReference(bookingReference)
                .customer(customerProfile)
                .vehicle(vehicle)
                .driver(null)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .pickupLocation(request.getPickupLocation())
                .dropoffLocation(request.getDropoffLocation())
                .customerPhoneNumber(request.getCustomerPhoneNumber())
                .tripType(request.getTripType())
                .passengerCount(request.getPassengerCount())
                .rejectionReason(null)
                .status(BookingStatus.PENDING)
                .notes(request.getNotes())
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Lock vehicle atomically to BOOKED upon booking creation
        vehicle.setStatus(VehicleStatus.BOOKED);
        vehicleRepository.save(vehicle);

        // Send notifications
        if (customerProfile.getUser() != null) {
            notificationService.createNotification(customerProfile.getUser(), "Booking Request Submitted",
                    "Your booking request " + bookingReference + " has been submitted and is pending owner review.", NotificationType.SYSTEM);
        }

        if (vehicle.getOwner() != null && vehicle.getOwner().getUser() != null) {
            notificationService.createNotification(vehicle.getOwner().getUser(), "New Booking Request Received",
                    "New booking request " + bookingReference + " received for vehicle " + vehicle.getBrand() + " " + vehicle.getModel() + ".", NotificationType.SYSTEM);
        }

        log.info("Booking request created successfully: {} for user: {}", bookingReference, customerProfile.getUser() != null ? customerProfile.getUser().getEmail() : customerId);

        return bookingMapper.toResponse(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return bookingMapper.toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(UserDetailsImpl userDetails, Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        validateBookingAccess(userDetails, booking);
        return bookingMapper.toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getCustomerBookings(Long customerId) {
        CustomerProfile customerProfile = customerProfileRepository.findByUserId(customerId).orElse(null);
        if (customerProfile == null) {
            return Collections.emptyList();
        }
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        return bookingRepository.findByCustomerIdAndBookingStatusInOrderByCreatedAtDesc(customerProfile.getId(), activeStatuses)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getCustomerHistory(Long customerId) {
        CustomerProfile customerProfile = customerProfileRepository.findByUserId(customerId).orElse(null);
        if (customerProfile == null) {
            return Collections.emptyList();
        }
        List<BookingStatus> historyStatuses = List.of(BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.REJECTED);
        return bookingRepository.findByCustomerIdAndBookingStatusInOrderByCreatedAtDesc(customerProfile.getId(), historyStatuses)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getOwnerBookings(Long ownerId) {
        OwnerProfile ownerProfile = ownerProfileRepository.findByUserId(ownerId).orElse(null);
        if (ownerProfile == null) {
            return Collections.emptyList();
        }
        return bookingRepository.findByVehicleOwnerIdOrderByCreatedAtDesc(ownerProfile.getId())
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getOwnerBookingsByStatus(Long ownerId, BookingStatus status) {
        OwnerProfile ownerProfile = ownerProfileRepository.findByUserId(ownerId).orElse(null);
        if (ownerProfile == null) {
            return Collections.emptyList();
        }
        return bookingRepository.findByVehicleOwnerIdAndStatusOrderByCreatedAtDesc(ownerProfile.getId(), status)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getDriverBookings(Long driverId) {
        DriverProfile driverProfile = driverProfileRepository.findByUserId(driverId).orElse(null);
        if (driverProfile == null) {
            return Collections.emptyList();
        }
        return bookingRepository.findByDriverIdOrderByCreatedAtDesc(driverProfile.getId())
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BookingResponse assignDriver(UserDetailsImpl userDetails, Long bookingId, Long driverId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        validateOwnerAccess(userDetails, booking);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Driver can only be assigned to a booking in PENDING status. Current status: " + booking.getStatus());
        }

        DriverProfile driverProfile = validateAndGetEligibleDriver(booking, driverId);
        booking.setDriver(driverProfile);
        booking.setStatus(BookingStatus.CONFIRMED);

        Booking saved = bookingRepository.save(booking);
        log.info("Owner {} assigned driver {} to booking {} and confirmed booking", userDetails.getId(), driverId, bookingId);

        // Record or update OwnerDriverUsageHistory
        try {
            User owner = (booking.getVehicle() != null && booking.getVehicle().getOwner() != null)
                    ? booking.getVehicle().getOwner().getUser() : null;
            if (owner != null) {
                OwnerDriverUsageHistory history = ownerDriverUsageHistoryRepository
                        .findFirstByOwnerIdAndDriverId(owner.getId(), driverProfile.getId())
                        .orElse(null);
                if (history != null) {
                    history.setLastUsedAt(LocalDateTime.now());
                    ownerDriverUsageHistoryRepository.save(history);
                } else {
                    OwnerDriverUsageHistory newHistory = OwnerDriverUsageHistory.builder()
                            .owner(owner)
                            .driver(driverProfile)
                            .firstUsedAt(LocalDateTime.now())
                            .lastUsedAt(LocalDateTime.now())
                            .build();
                    ownerDriverUsageHistoryRepository.save(newHistory);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to record owner driver usage history for booking {}: {}", bookingId, e.getMessage());
        }

        // Send confirmation email and notifications only after successful confirmation
        try {
            emailService.sendBookingConfirmationEmail(saved);
        } catch (Exception e) {
            log.warn("Failed to send booking confirmation email for booking {}: {}", saved.getBookingReference(), e.getMessage());
        }

        if (saved.getCustomer() != null && saved.getCustomer().getUser() != null) {
            String driverInfo = (saved.getDriver() != null && saved.getDriver().getUser() != null)
                    ? saved.getDriver().getUser().getFullName() + " (Phone: " + saved.getDriver().getUser().getPhoneNumber() + ")"
                    : "Assigned driver";
            String vehicleInfo = (saved.getVehicle() != null)
                    ? saved.getVehicle().getBrand() + " " + saved.getVehicle().getModel()
                    : "vehicle";
            notificationService.createNotification(saved.getCustomer().getUser(), "Booking Confirmed",
                    "Your booking " + saved.getBookingReference() + " for " + vehicleInfo + " has been confirmed. Driver: " + driverInfo,
                    NotificationType.SYSTEM);
        }

        if (saved.getDriver() != null && saved.getDriver().getUser() != null) {
            String vehicleInfo = (saved.getVehicle() != null)
                    ? saved.getVehicle().getBrand() + " " + saved.getVehicle().getModel()
                    : "vehicle";
            notificationService.createNotification(saved.getDriver().getUser(), "New Trip Assigned",
                    "You have been assigned to trip " + saved.getBookingReference() + " for " + vehicleInfo + ".",
                    NotificationType.SYSTEM);
        }

        return bookingMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse replaceDriver(UserDetailsImpl userDetails, Long bookingId, DriverReplacementRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        validateOwnerAccess(userDetails, booking);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Driver replacement is not allowed for CANCELLED bookings");
        }
        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new BadRequestException("Driver replacement is not allowed for REJECTED bookings");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Driver replacement is not allowed for COMPLETED bookings");
        }

        DriverProfile oldDriver = booking.getDriver();
        if (oldDriver == null) {
            throw new BadRequestException("No driver is currently assigned to this booking. Use assign-driver instead.");
        }

        if (request == null || request.getEffectiveDriverId() == null) {
            throw new BadRequestException("New driver ID is required");
        }
        Long newDriverId = request.getEffectiveDriverId();

        if (oldDriver.getId().equals(newDriverId)) {
            throw new BadRequestException("Replacement driver cannot be the same as the currently assigned driver");
        }

        DriverProfile newDriverProfile = validateAndGetEligibleDriver(booking, newDriverId);
        User newDriverUser = newDriverProfile.getUser();

        // Release old driver
        boolean oldDriverHasOtherTrips = bookingRepository.hasOtherInProgressBookingForDriver(oldDriver.getId(), booking.getId());
        if (!oldDriverHasOtherTrips) {
            oldDriver.setStatus(DriverStatus.ACTIVE);
            oldDriver.setInactiveReason(null);
            driverProfileRepository.save(oldDriver);
        }

        // Assign new driver
        booking.setDriver(newDriverProfile);

        if (booking.getStatus() == BookingStatus.IN_PROGRESS) {
            newDriverProfile.setStatus(DriverStatus.ON_TRIP);
            driverProfileRepository.save(newDriverProfile);
        }

        if (request.getReason() != null && !request.getReason().isBlank()) {
            String oldName = oldDriver.getUser() != null ? oldDriver.getUser().getFullName() : "Driver " + oldDriver.getId();
            String newName = newDriverUser != null ? newDriverUser.getFullName() : "Driver " + newDriverProfile.getId();
            String note = "[Driver Replacement] Old: " + oldName + ", New: " + newName + ", Reason: " + request.getReason();
            booking.setNotes(booking.getNotes() != null ? booking.getNotes() + "\n" + note : note);
        }

        // Update driver usage history
        try {
            User owner = (booking.getVehicle() != null && booking.getVehicle().getOwner() != null)
                    ? booking.getVehicle().getOwner().getUser() : null;
            if (owner != null) {
                OwnerDriverUsageHistory history = ownerDriverUsageHistoryRepository
                        .findFirstByOwnerIdAndDriverId(owner.getId(), newDriverProfile.getId())
                        .orElse(null);
                if (history != null) {
                    history.setLastUsedAt(LocalDateTime.now());
                    ownerDriverUsageHistoryRepository.save(history);
                } else {
                    OwnerDriverUsageHistory newHistory = OwnerDriverUsageHistory.builder()
                            .owner(owner)
                            .driver(newDriverProfile)
                            .firstUsedAt(LocalDateTime.now())
                            .lastUsedAt(LocalDateTime.now())
                            .build();
                    ownerDriverUsageHistoryRepository.save(newHistory);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to record owner driver usage history for replacement: {}", e.getMessage());
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Owner {} replaced driver for booking {} from {} to {}", userDetails.getId(), bookingId, oldDriver.getId(), newDriverId);

        executeAfterCommitOrDirectly(() -> {
            if (saved.getCustomer() != null && saved.getCustomer().getUser() != null) {
                notificationService.createNotification(
                        saved.getCustomer().getUser(),
                        "Driver Replaced",
                        "The driver for your booking " + saved.getBookingReference() + " has been changed to " + (newDriverUser != null ? newDriverUser.getFullName() : "new driver") + " (Phone: " + (newDriverUser != null ? newDriverUser.getPhoneNumber() : "N/A") + ").",
                        NotificationType.SYSTEM
                );
                try {
                    emailService.sendDriverReplacementEmail(saved, oldDriver, newDriverProfile, request.getReason());
                } catch (Exception e) {
                    log.warn("Failed to send driver replacement email: {}", e.getMessage());
                }
            }
            if (oldDriver.getUser() != null) {
                notificationService.createNotification(
                        oldDriver.getUser(),
                        "Trip Assignment Reassigned",
                        "You have been unassigned from booking " + saved.getBookingReference() + ".",
                        NotificationType.SYSTEM
                );
            }
            if (newDriverUser != null) {
                notificationService.createNotification(
                        newDriverUser,
                        "New Trip Assigned",
                        "You have been assigned to trip " + saved.getBookingReference() + ".",
                        NotificationType.SYSTEM
                );
            }
        });

        return bookingMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse replaceVehicle(UserDetailsImpl userDetails, Long bookingId, VehicleReplacementRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        validateOwnerAccess(userDetails, booking);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Vehicle replacement is not allowed for CANCELLED bookings");
        }
        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new BadRequestException("Vehicle replacement is not allowed for REJECTED bookings");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Vehicle replacement is not allowed for COMPLETED bookings");
        }

        Vehicle oldVehicle = booking.getVehicle();
        if (oldVehicle == null) {
            throw new BadRequestException("No vehicle is currently assigned to this booking");
        }

        if (request == null || request.getEffectiveVehicleId() == null) {
            throw new BadRequestException("New vehicle ID is required");
        }
        Long newVehicleId = request.getEffectiveVehicleId();

        if (oldVehicle.getId().equals(newVehicleId)) {
            throw new BadRequestException("Replacement vehicle cannot be the same as the currently assigned vehicle");
        }

        Vehicle newVehicle = vehicleRepository.findById(newVehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + newVehicleId));

        if (newVehicle.getOwner() == null || newVehicle.getOwner().getUser() == null || !newVehicle.getOwner().getUser().getId().equals(userDetails.getId())) {
            throw new BadRequestException("Replacement vehicle must belong to your fleet");
        }

        if (newVehicle.getApprovalStatus() == ApprovalDecision.PENDING) {
            throw new BadRequestException("Vehicle is pending admin approval");
        }
        if (newVehicle.getApprovalStatus() == ApprovalDecision.REJECTED) {
            throw new BadRequestException("Vehicle has been rejected by admin");
        }
        if (newVehicle.getApprovalStatus() != ApprovalDecision.APPROVED) {
            throw new BadRequestException("Vehicle is not approved by admin");
        }

        if (newVehicle.getStatus() == VehicleStatus.INACTIVE) {
            throw new BadRequestException("Vehicle is inactive");
        }
        if (newVehicle.getStatus() == VehicleStatus.MAINTENANCE) {
            throw new BadRequestException("Vehicle is under maintenance");
        }
        if (newVehicle.getStatus() == VehicleStatus.ON_TRIP) {
            throw new BadRequestException("Vehicle is currently on another trip");
        }
        if (newVehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new BadRequestException("Vehicle is not available (status: " + newVehicle.getStatus() + ")");
        }

        if (newVehicle.getSeatingCapacity() != null && booking.getPassengerCount() != null
                && newVehicle.getSeatingCapacity() < booking.getPassengerCount()) {
            throw new BadRequestException("Replacement vehicle seating capacity (" + newVehicle.getSeatingCapacity()
                    + ") is less than required passenger count (" + booking.getPassengerCount() + ")");
        }

        LocalDateTime start = booking.getStartDateTime();
        LocalDateTime end = booking.getEndDateTime() != null ? booking.getEndDateTime() : start.plusDays(1);
        if (bookingRepository.existsConflictingVehicleBooking(newVehicleId, booking.getId(), start, end)) {
            throw new BadRequestException("Vehicle has a conflicting booking during this period");
        }

        // Release old vehicle
        boolean oldVehicleHasOtherTrips = bookingRepository.hasOtherInProgressBookingForVehicle(oldVehicle.getId(), booking.getId());
        if (!oldVehicleHasOtherTrips && oldVehicle.getStatus() == VehicleStatus.ON_TRIP) {
            oldVehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(oldVehicle);
        }

        // Assign new vehicle
        booking.setVehicle(newVehicle);

        if (booking.getStatus() == BookingStatus.IN_PROGRESS) {
            newVehicle.setStatus(VehicleStatus.ON_TRIP);
            vehicleRepository.save(newVehicle);
        }

        if (request.getReason() != null && !request.getReason().isBlank()) {
            String note = "[Vehicle Replacement] Old: " + oldVehicle.getBrand() + " " + oldVehicle.getModel() + " (" + oldVehicle.getLicensePlate()
                    + "), New: " + newVehicle.getBrand() + " " + newVehicle.getModel() + " (" + newVehicle.getLicensePlate() + "), Reason: " + request.getReason();
            booking.setNotes(booking.getNotes() != null ? booking.getNotes() + "\n" + note : note);
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Owner {} replaced vehicle for booking {} from {} to {}", userDetails.getId(), bookingId, oldVehicle.getId(), newVehicleId);

        executeAfterCommitOrDirectly(() -> {
            if (saved.getCustomer() != null && saved.getCustomer().getUser() != null) {
                notificationService.createNotification(
                        saved.getCustomer().getUser(),
                        "Vehicle Replaced",
                        "The vehicle for your booking " + saved.getBookingReference() + " has been changed to " + newVehicle.getBrand() + " " + newVehicle.getModel() + " (" + newVehicle.getLicensePlate() + ").",
                        NotificationType.SYSTEM
                );
                try {
                    emailService.sendVehicleReplacementEmail(saved, oldVehicle, newVehicle, request.getReason());
                } catch (Exception e) {
                    log.warn("Failed to send vehicle replacement email: {}", e.getMessage());
                }
            }
            if (saved.getDriver() != null && saved.getDriver().getUser() != null) {
                notificationService.createNotification(
                        saved.getDriver().getUser(),
                        "Vehicle Updated for Trip",
                        "The vehicle for trip " + saved.getBookingReference() + " has been changed to " + newVehicle.getBrand() + " " + newVehicle.getModel() + " (" + newVehicle.getLicensePlate() + ").",
                        NotificationType.SYSTEM
                );
            }
        });

        return bookingMapper.toResponse(saved);
    }

    private void executeAfterCommitOrDirectly(Runnable action) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        action.run();
                    } catch (Exception e) {
                        log.warn("Post-commit action failed: {}", e.getMessage());
                    }
                }
            });
        } else {
            try {
                action.run();
            } catch (Exception e) {
                log.warn("Action failed: {}", e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request) {
        return updateBookingStatus(null, bookingId, request);
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(UserDetailsImpl userDetails, Long bookingId, BookingStatusUpdateRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (request == null || request.getStatus() == null) {
            throw new BadRequestException("Booking status is required");
        }

        BookingStatus newStatus = request.getStatus();

        // CONFIRMED is rejected here because assignDriver is the only confirmation operation
        if (newStatus == BookingStatus.CONFIRMED) {
            throw new BadRequestException("Bookings cannot be confirmed directly via status update. Assign an eligible driver via the assign-driver endpoint to confirm the booking.");
        }

        // Only PENDING (accept), REJECTED, or CANCELLED can be set via this endpoint
        if (newStatus != BookingStatus.PENDING && newStatus != BookingStatus.REJECTED && newStatus != BookingStatus.CANCELLED) {
            throw new BadRequestException("Invalid booking status transition. Only PENDING (accept), REJECTED, or CANCELLED can be set via this endpoint.");
        }

        BookingStatus currentStatus = booking.getStatus();
        if (currentStatus == BookingStatus.CANCELLED || currentStatus == BookingStatus.REJECTED || currentStatus == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot modify a booking that is already " + currentStatus);
        }

        boolean isCustomer = false;
        if (userDetails != null) {
            boolean userIsCustomer = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
            boolean userIsOwner = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_OWNER"));
            boolean userIsDriver = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DRIVER"));
            boolean userIsAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (userIsDriver  && !userIsOwner) {
                throw new BadRequestException("Drivers cannot confirm, reject, or cancel bookings");
            }

            if (userIsAdmin) {
                throw new BadRequestException("Admins are not permitted to accept or reject bookings. Only the vehicle owner can make booking decisions.");
            }

            if (userIsCustomer) {
                isCustomer = true;
                if (newStatus != BookingStatus.CANCELLED) {
                    throw new BadRequestException("Customers are only permitted to cancel bookings");
                }
                boolean isBookingCustomer = booking.getCustomer() != null
                        && booking.getCustomer().getUser() != null
                        && booking.getCustomer().getUser().getId().equals(userDetails.getId());
                if (!isBookingCustomer) {
                    throw new BadRequestException("You are not authorized to cancel this booking");
                }
                if (currentStatus != BookingStatus.PENDING) {
                    throw new BadRequestException("Customers can only cancel bookings that are in PENDING status. Current status: " + currentStatus);
                }
            } else if (userIsOwner) {
                boolean isVehicleOwner = booking.getVehicle() != null
                        && booking.getVehicle().getOwner() != null
                        && booking.getVehicle().getOwner().getUser() != null
                        && booking.getVehicle().getOwner().getUser().getId().equals(userDetails.getId());
                if (!isVehicleOwner) {
                    throw new BadRequestException("Only the vehicle owner can perform this operation on this booking");
                }
            }
        }

        if (newStatus == BookingStatus.PENDING) {
            if (currentStatus != BookingStatus.PENDING) {
                throw new BadRequestException("Only PENDING bookings can be accepted by owner. Current status: " + currentStatus);
            }
            // Owner acceptance: booking remains PENDING, vehicle remains BOOKED
            booking.setStatus(BookingStatus.PENDING);
            if (booking.getVehicle() != null) {
                booking.getVehicle().setStatus(VehicleStatus.BOOKED);
                vehicleRepository.save(booking.getVehicle());
            }
        } else if (newStatus == BookingStatus.REJECTED) {
            if (currentStatus != BookingStatus.PENDING) {
                throw new BadRequestException("Only PENDING bookings can be rejected. Current status: " + currentStatus);
            }

            String reason = request.getRejectionReason();
            if (reason == null || reason.trim().isEmpty()) {
                throw new BadRequestException("Rejection reason is mandatory when rejecting a booking");
            }

            booking.setRejectionReason(reason.trim());
            booking.setStatus(BookingStatus.REJECTED);
            // Release vehicle lock
            if (booking.getVehicle() != null) {
                booking.getVehicle().setStatus(VehicleStatus.AVAILABLE);
                vehicleRepository.save(booking.getVehicle());
            }
        } else if (newStatus == BookingStatus.CANCELLED) {
            if (currentStatus == BookingStatus.IN_PROGRESS || currentStatus == BookingStatus.COMPLETED) {
                throw new BadRequestException("Cannot cancel a booking that is already " + currentStatus);
            }
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setCancelledAt(LocalDateTime.now());
            String reason = request.getRejectionReason();
            if (reason != null && !reason.trim().isEmpty()) {
                if (booking.getNotes() == null || booking.getNotes().trim().isEmpty()) {
                    booking.setNotes("Cancelled: " + reason.trim());
                } else {
                    booking.setNotes(booking.getNotes() + " | Cancelled: " + reason.trim());
                }
            }
            // Release vehicle lock
            if (booking.getVehicle() != null) {
                booking.getVehicle().setStatus(VehicleStatus.AVAILABLE);
                vehicleRepository.save(booking.getVehicle());
            }
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Updated booking status for id: {} from {} to {}", bookingId, currentStatus, saved.getStatus());

        // Notifications & Emails
        if (newStatus == BookingStatus.PENDING) {
            if (saved.getCustomer() != null && saved.getCustomer().getUser() != null) {
                notificationService.createNotification(saved.getCustomer().getUser(), "Booking Accepted by Owner",
                        "Your booking request " + saved.getBookingReference() + " has been accepted by the owner and is pending driver assignment.",
                        NotificationType.SYSTEM);
            }
        } else if (newStatus == BookingStatus.REJECTED) {
            if (saved.getCustomer() != null && saved.getCustomer().getUser() != null) {
                notificationService.createNotification(saved.getCustomer().getUser(), "Booking Rejected",
                        "Your booking request " + saved.getBookingReference() + " has been rejected by the owner. Reason: " + saved.getRejectionReason(),
                        NotificationType.SYSTEM);
            }
        } else if (newStatus == BookingStatus.CANCELLED) {
            if (isCustomer) {
                if (saved.getCustomer() != null && saved.getCustomer().getUser() != null) {
                    notificationService.createNotification(saved.getCustomer().getUser(), "Booking Cancelled",
                            "Your booking " + saved.getBookingReference() + " has been cancelled.",
                            NotificationType.SYSTEM);
                }
                if (saved.getVehicle() != null && saved.getVehicle().getOwner() != null && saved.getVehicle().getOwner().getUser() != null) {
                    notificationService.createNotification(saved.getVehicle().getOwner().getUser(), "Booking Cancelled by Customer",
                            "Booking " + saved.getBookingReference() + " has been cancelled by the customer.",
                            NotificationType.SYSTEM);
                }
            } else {
                if (saved.getCustomer() != null && saved.getCustomer().getUser() != null) {
                    notificationService.createNotification(saved.getCustomer().getUser(), "Booking Cancelled",
                            "Your booking " + saved.getBookingReference() + " has been cancelled by the vehicle owner.",
                            NotificationType.SYSTEM);
                }
                if (saved.getDriver() != null && saved.getDriver().getUser() != null) {
                    notificationService.createNotification(saved.getDriver().getUser(), "Trip Cancelled",
                            "Trip " + saved.getBookingReference() + " has been cancelled.",
                            NotificationType.SYSTEM);
                }
            }
        }

        return bookingMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse updateDriverTripStatus(UserDetailsImpl userDetails, Long bookingId, BookingStatusUpdateRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (userDetails == null) {
            throw new BadRequestException("Authentication required");
        }

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        boolean isAssignedDriver = booking.getDriver() != null
                && booking.getDriver().getUser() != null
                && booking.getDriver().getUser().getId().equals(userDetails.getId());

        if (!isAdmin && !isAssignedDriver) {
            throw new BadRequestException("Only the assigned driver can update the trip status");
        }

        if (request == null || request.getStatus() == null) {
            throw new BadRequestException("Status is required");
        }

        BookingStatus newStatus = request.getStatus();

        if (newStatus == BookingStatus.CONFIRMED || newStatus == BookingStatus.REJECTED || newStatus == BookingStatus.CANCELLED) {
            throw new BadRequestException("Drivers cannot confirm, reject, or cancel bookings");
        }

        if (newStatus == BookingStatus.IN_PROGRESS) {
            if (booking.getStatus() != BookingStatus.CONFIRMED) {
                throw new BadRequestException("Trip can only be started when booking is CONFIRMED. Current status: " + booking.getStatus());
            }
            booking.setStatus(BookingStatus.IN_PROGRESS);
            if (booking.getVehicle() != null) {
                booking.getVehicle().setStatus(VehicleStatus.ON_TRIP);
                vehicleRepository.save(booking.getVehicle());
            }
            if (booking.getDriver() != null) {
                DriverProfile driverProfile = booking.getDriver();
                driverProfile.setStatus(DriverStatus.ON_TRIP);
                driverProfile.setInactiveReason(null);
                driverProfileRepository.save(driverProfile);
            }
            Trip trip = tripRepository.findByBookingId(booking.getId()).orElse(null);
            if (trip == null) {
                trip = Trip.builder()
                        .booking(booking)
                        .startedAt(LocalDateTime.now())
                        .status("IN_PROGRESS")
                        .actualStartLocation(booking.getPickupLocation())
                        .build();
            } else {
                trip.setStartedAt(LocalDateTime.now());
                trip.setStatus("IN_PROGRESS");
            }
            tripRepository.save(trip);
        } else if (newStatus == BookingStatus.COMPLETED) {
            if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
                throw new BadRequestException("Trip can only be completed when it is IN_PROGRESS. Current status: " + booking.getStatus());
            }
            booking.setStatus(BookingStatus.COMPLETED);
            if (booking.getVehicle() != null) {
                booking.getVehicle().setStatus(VehicleStatus.AVAILABLE);
                vehicleRepository.save(booking.getVehicle());
            }
            if (booking.getDriver() != null) {
                DriverProfile driverProfile = booking.getDriver();
                boolean hasOtherTrips = bookingRepository.hasOtherInProgressBookingForDriver(driverProfile.getId(), booking.getId());
                if (!hasOtherTrips) {
                    driverProfile.setStatus(DriverStatus.ACTIVE);
                    driverProfile.setInactiveReason(null);
                    driverProfileRepository.save(driverProfile);
                }
            }
            Trip trip = tripRepository.findByBookingId(booking.getId()).orElse(null);
            if (trip != null) {
                trip.setCompletedAt(LocalDateTime.now());
                trip.setStatus("COMPLETED");
                trip.setActualEndLocation(booking.getDropoffLocation());
                tripRepository.save(trip);
            }
        } else {
            throw new BadRequestException("Invalid trip status transition: " + newStatus);
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Driver {} updated trip {} status to {}", userDetails.getId(), bookingId, newStatus);

        return bookingMapper.toResponse(saved);
    }

    private void validateOwnerAccess(UserDetailsImpl userDetails, Booking booking) {
        if (userDetails == null) {
            throw new BadRequestException("Authentication required");
        }

        boolean isCustomer = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
        if (isCustomer) {
            throw new BadRequestException("Customers are not permitted to assign drivers or manage owner operations");
        }

        boolean isOwner = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OWNER"));

        boolean isDriver = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DRIVER"));

        if (isDriver && !isOwner) {
            throw new BadRequestException("Drivers cannot perform this action");
        }

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            throw new BadRequestException("Admins are not permitted to assign drivers or manage bookings. Only the vehicle owner can make these decisions.");
        }

        boolean isVehicleOwner = booking.getVehicle() != null
                && booking.getVehicle().getOwner() != null
                && booking.getVehicle().getOwner().getUser() != null
                && booking.getVehicle().getOwner().getUser().getId().equals(userDetails.getId());

        if (!isVehicleOwner) {
            throw new BadRequestException("Only the vehicle owner can perform this operation on this booking");
        }
    }

    private DriverProfile validateAndGetEligibleDriver(Booking booking, Long driverId) {
        if (driverId == null) {
            throw new BadRequestException("Driver ID must be specified");
        }

        DriverProfile profile = driverProfileRepository.findByIdWithDetails(driverId)
                .or(() -> driverProfileRepository.findById(driverId))
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found with id: " + driverId));

        User driverUser = profile.getUser();
        if (driverUser == null) {
            throw new BadRequestException("Driver user profile is invalid");
        }

        boolean hasDriverRole = (driverUser.getRoles() != null && driverUser.getRoles().contains(Role.DRIVER))
                || driverUser.getRole() == Role.DRIVER;

        if (!hasDriverRole) {
            throw new BadRequestException("Selected user is not registered as a driver");
        }

        if (Boolean.FALSE.equals(driverUser.getIsActive())) {
            throw new BadRequestException("Driver account is deactivated");
        }

        // Owner-as-Driver isolation check: an owner-driver can only be assigned to their own vehicles
        boolean isOwnerDriver = (driverUser.getRoles() != null && driverUser.getRoles().contains(Role.OWNER))
                || driverUser.getRole() == Role.OWNER;
        if (isOwnerDriver) {
            if (booking == null || booking.getVehicle() == null || booking.getVehicle().getOwner() == null
                    || booking.getVehicle().getOwner().getUser() == null
                    || !booking.getVehicle().getOwner().getUser().getId().equals(driverUser.getId())) {
                throw new BadRequestException("An owner-driver can only be assigned to their own vehicles");
            }
        }

        if (profile.getApprovalStatus() == ApprovalDecision.PENDING) {
            throw new BadRequestException("Driver has not been approved by admin (status: PENDING)");
        }
        if (profile.getApprovalStatus() == ApprovalDecision.REJECTED) {
            throw new BadRequestException("Driver has been rejected by admin");
        }
        if (profile.getApprovalStatus() != ApprovalDecision.APPROVED) {
            throw new BadRequestException("Driver has not been approved by admin");
        }

        if (profile.getStatus() == DriverStatus.INACTIVE) {
            throw new BadRequestException("Driver is inactive");
        }
        if (profile.getStatus() == DriverStatus.ON_TRIP) {
            throw new BadRequestException("Driver is currently on another trip");
        }
        if (profile.getStatus() != DriverStatus.ACTIVE) {
            throw new BadRequestException("Driver is not available for assignment (status: " + profile.getStatus() + ")");
        }

        if (profile.getLicenseExpiryDate() != null && profile.getLicenseExpiryDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Driver's driving license has expired");
        }

        if (booking != null && booking.getStartDateTime() != null) {
            LocalDateTime start = booking.getStartDateTime();
            LocalDateTime end = booking.getEndDateTime() != null ? booking.getEndDateTime() : start.plusDays(1);
            Long excludeBookingId = booking.getId() != null ? booking.getId() : -1L;
            if (bookingRepository.existsConflictingDriverBooking(profile.getId(), excludeBookingId, start, end)) {
                throw new BadRequestException("Driver has a conflicting booking during this period");
            }
        }

        return profile;
    }

    private void validateBookingAccess(UserDetailsImpl userDetails, Booking booking) {
        if (userDetails == null) {
            throw new BadRequestException("Authentication required to access booking details");
        }

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return;
        }

        boolean isCustomer = booking.getCustomer() != null
                && booking.getCustomer().getUser() != null
                && booking.getCustomer().getUser().getId().equals(userDetails.getId());
        boolean isOwner = booking.getVehicle() != null
                && booking.getVehicle().getOwner() != null
                && booking.getVehicle().getOwner().getUser() != null
                && booking.getVehicle().getOwner().getUser().getId().equals(userDetails.getId());
        boolean isDriver = booking.getDriver() != null
                && booking.getDriver().getUser() != null
                && booking.getDriver().getUser().getId().equals(userDetails.getId());

        if (!isCustomer && !isOwner && !isDriver) {
            throw new BadRequestException("You do not have permission to view this booking");
        }
    }
}