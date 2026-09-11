package com.carrental.booking.service.impl;

import com.carrental.booking.service.BookingService;

import com.carrental.auth.entity.User;
import com.carrental.auth.repository.UserRepository;
import com.carrental.booking.dto.request.BookingRequest;
import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.dto.request.BookingStatusUpdateRequest;
import com.carrental.booking.entity.Booking;
import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.repository.BookingRepository;
import com.carrental.common.exception.BadRequestException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.notification.enums.NotificationType;
import com.carrental.notification.service.EmailService;
import com.carrental.notification.service.NotificationService;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.repository.VehicleRepository;
import com.carrental.auth.enums.Role;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.booking.mapper.BookingMapper;
import com.carrental.security.service.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final BookingMapper bookingMapper;

    @Override
    @Transactional
    public BookingResponse createBooking(Long customerId, BookingRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", request.getVehicleId()));

        if (!"APPROVED".equalsIgnoreCase(vehicle.getApprovalStatus()) ||
                (vehicle.getStatus() != VehicleStatus.AVAILABLE && vehicle.getStatus() != VehicleStatus.APPROVED)) {
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
                .customer(customer)
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

        // Send notifications
        notificationService.createNotification(customer, "Booking Request Submitted",
                "Your booking request " + bookingReference + " has been submitted and is pending owner review.", NotificationType.SYSTEM);

        if (vehicle.getOwner() != null) {
            notificationService.createNotification(vehicle.getOwner(), "New Booking Request Received",
                    "New booking request " + bookingReference + " received for vehicle " + vehicle.getBrand() + " " + vehicle.getModel() + ".", NotificationType.SYSTEM);
        }

        log.info("Booking request created successfully: {} for user: {}", bookingReference, customer.getEmail());

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
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        return bookingRepository.findByCustomerIdAndBookingStatusInOrderByCreatedAtDesc(customerId, activeStatuses)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getCustomerHistory(Long customerId) {
        List<BookingStatus> historyStatuses = List.of(BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.REJECTED);
        return bookingRepository.findByCustomerIdAndBookingStatusInOrderByCreatedAtDesc(customerId, historyStatuses)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getOwnerBookings(Long ownerId) {
        return bookingRepository.findByVehicleOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getOwnerBookingsByStatus(Long ownerId, BookingStatus status) {
        return bookingRepository.findByVehicleOwnerIdAndStatusOrderByCreatedAtDesc(ownerId, status)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getDriverBookings(Long driverId) {
        return bookingRepository.findByDriverIdOrderByCreatedAtDesc(driverId)
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

        User driver = validateAndGetEligibleDriver(driverId);
        booking.setDriver(driver);
        booking.setStatus(BookingStatus.CONFIRMED);

        Booking saved = bookingRepository.save(booking);
        log.info("Owner {} assigned driver {} to booking {} and confirmed booking", userDetails.getId(), driverId, bookingId);

        // Send confirmation email and notifications only after successful confirmation
        try {
            emailService.sendBookingConfirmationEmail(saved);
        } catch (Exception e) {
            log.warn("Failed to send booking confirmation email for booking {}: {}", saved.getBookingReference(), e.getMessage());
        }

        if (saved.getCustomer() != null) {
            String driverInfo = (saved.getDriver() != null)
                    ? saved.getDriver().getFullName() + " (Phone: " + saved.getDriver().getPhoneNumber() + ")"
                    : "Assigned driver";
            String vehicleInfo = (saved.getVehicle() != null)
                    ? saved.getVehicle().getBrand() + " " + saved.getVehicle().getModel()
                    : "vehicle";
            notificationService.createNotification(saved.getCustomer(), "Booking Confirmed",
                    "Your booking " + saved.getBookingReference() + " for " + vehicleInfo + " has been confirmed. Driver: " + driverInfo,
                    NotificationType.SYSTEM);
        }

        if (saved.getDriver() != null) {
            String vehicleInfo = (saved.getVehicle() != null)
                    ? saved.getVehicle().getBrand() + " " + saved.getVehicle().getModel()
                    : "vehicle";
            notificationService.createNotification(saved.getDriver(), "New Trip Assigned",
                    "You have been assigned to trip " + saved.getBookingReference() + " for " + vehicleInfo + ".",
                    NotificationType.SYSTEM);
        }

        return bookingMapper.toResponse(saved);
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

        if (userDetails != null) {
            validateOwnerAccess(userDetails, booking);
        }

        if (request == null || request.getStatus() == null) {
            throw new BadRequestException("Booking status is required");
        }

        BookingStatus newStatus = request.getStatus();

        // CONFIRMED is rejected here because assignDriver is the only confirmation operation
        if (newStatus == BookingStatus.CONFIRMED) {
            throw new BadRequestException("Bookings cannot be confirmed directly via status update. Assign an eligible driver via the assign-driver endpoint to confirm the booking.");
        }

        // Only Owner (or Admin) can set REJECTED or CANCELLED
        if (newStatus != BookingStatus.REJECTED && newStatus != BookingStatus.CANCELLED) {
            throw new BadRequestException("Invalid booking status transition. Only REJECTED or CANCELLED can be set via this endpoint.");
        }

        BookingStatus currentStatus = booking.getStatus();
        if (currentStatus == BookingStatus.CANCELLED || currentStatus == BookingStatus.REJECTED || currentStatus == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot modify a booking that is already " + currentStatus);
        }

        if (newStatus == BookingStatus.REJECTED) {
            if (currentStatus != BookingStatus.PENDING) {
                throw new BadRequestException("Only PENDING bookings can be rejected. Current status: " + currentStatus);
            }

            String reason = request.getRejectionReason();
            if (reason == null || reason.trim().isEmpty()) {
                throw new BadRequestException("Rejection reason is mandatory when rejecting a booking");
            }

            booking.setRejectionReason(reason.trim());
            booking.setStatus(BookingStatus.REJECTED);
        } else if (newStatus == BookingStatus.CANCELLED) {
            if (currentStatus == BookingStatus.IN_PROGRESS) {
                throw new BadRequestException("Cannot cancel a booking that is already IN_PROGRESS");
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
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Updated booking status for id: {} from {} to {}", bookingId, currentStatus, saved.getStatus());

        // Notifications & Emails
        if (newStatus == BookingStatus.REJECTED) {
            if (saved.getCustomer() != null) {
                notificationService.createNotification(saved.getCustomer(), "Booking Rejected",
                        "Your booking request " + saved.getBookingReference() + " has been rejected by the owner. Reason: " + saved.getRejectionReason(),
                        NotificationType.SYSTEM);
            }
        } else if (newStatus == BookingStatus.CANCELLED) {
            if (saved.getCustomer() != null) {
                notificationService.createNotification(saved.getCustomer(), "Booking Cancelled",
                        "Your booking " + saved.getBookingReference() + " has been cancelled by the vehicle owner.",
                        NotificationType.SYSTEM);
            }
            if (saved.getDriver() != null) {
                notificationService.createNotification(saved.getDriver(), "Trip Cancelled",
                        "Trip " + saved.getBookingReference() + " has been cancelled.",
                        NotificationType.SYSTEM);
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
                && booking.getDriver().getId().equals(userDetails.getId());

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
        } else if (newStatus == BookingStatus.COMPLETED) {
            if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
                throw new BadRequestException("Trip can only be completed when it is IN_PROGRESS. Current status: " + booking.getStatus());
            }
        } else {
            throw new BadRequestException("Invalid trip status transition: " + newStatus);
        }

        booking.setStatus(newStatus);
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
            throw new BadRequestException("Customers are not permitted to change booking status or cancel bookings");
        }

        boolean isDriver = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DRIVER"));
        if (isDriver) {
            throw new BadRequestException("Drivers cannot confirm, reject, or cancel bookings");
        }

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        boolean isVehicleOwner = booking.getVehicle() != null
                && booking.getVehicle().getOwner() != null
                && booking.getVehicle().getOwner().getId().equals(userDetails.getId());

        if (!isAdmin && !isVehicleOwner) {
            throw new BadRequestException("Only the vehicle owner can perform this operation on this booking");
        }
    }

    private User validateAndGetEligibleDriver(Long driverId) {
        if (driverId == null) {
            throw new BadRequestException("Driver ID must be specified");
        }

        User driverUser = userRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver user not found with id: " + driverId));

        boolean hasDriverRole = (driverUser.getRoles() != null && driverUser.getRoles().stream()
                .anyMatch(r -> r == Role.DRIVER || r == Role.ROLE_DRIVER))
                || driverUser.getRole() == Role.DRIVER
                || driverUser.getRole() == Role.ROLE_DRIVER;

        if (!hasDriverRole) {
            throw new BadRequestException("Selected user is not registered as a driver");
        }

        if (Boolean.FALSE.equals(driverUser.getIsActive())) {
            throw new BadRequestException("Driver account is deactivated");
        }

        DriverProfile profile = driverProfileRepository.findByUserId(driverId)
                .orElse(null);

        if (profile != null) {
            boolean isApproved = "APPROVED".equalsIgnoreCase(profile.getApprovalStatus())
                    || profile.getStatus() == DriverStatus.APPROVED
                    || profile.getStatus() == DriverStatus.AVAILABLE;

            if (!isApproved) {
                throw new BadRequestException("Driver has not been approved by admin");
            }

            if (profile.getStatus() == DriverStatus.OFFLINE || profile.getStatus() == DriverStatus.REJECTED) {
                throw new BadRequestException("Driver is currently offline or rejected");
            }

            if (profile.getLicenseExpiryDate() != null && profile.getLicenseExpiryDate().isBefore(LocalDate.now())) {
                throw new BadRequestException("Driver's driving license has expired");
            }
        }

        return driverUser;
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

        boolean isCustomer = booking.getCustomer() != null && booking.getCustomer().getId().equals(userDetails.getId());
        boolean isOwner = booking.getVehicle() != null && booking.getVehicle().getOwner() != null
                && booking.getVehicle().getOwner().getId().equals(userDetails.getId());
        boolean isDriver = booking.getDriver() != null && booking.getDriver().getId().equals(userDetails.getId());

        if (!isCustomer && !isOwner && !isDriver) {
            throw new BadRequestException("You do not have permission to view this booking");
        }
    }
}

