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
import com.carrental.booking.mapper.BookingMapper;
import com.carrental.security.service.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
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

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new BadRequestException("Vehicle is currently not available for booking");
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
                .bookingStatus(BookingStatus.PENDING)
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
    public List<BookingResponse> getDriverBookings(Long driverId) {
        return bookingRepository.findByDriverIdOrderByCreatedAtDesc(driverId)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        BookingStatus oldStatus = booking.getBookingStatus();

        if (request.getBookingStatus() != null) {
            booking.setBookingStatus(request.getBookingStatus());
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Updated booking status for id: {} to {}", bookingId, booking.getBookingStatus());

        // Send confirmation email when transitioned to CONFIRMED (avoid duplicate if already CONFIRMED)
        if (oldStatus != BookingStatus.CONFIRMED && saved.getBookingStatus() == BookingStatus.CONFIRMED) {
            try {
                emailService.sendBookingConfirmationEmail(saved);
            } catch (Exception e) {
                log.warn("Failed to send booking confirmation email for booking {}: {}", saved.getBookingReference(), e.getMessage());
            }
        }

        return bookingMapper.toResponse(saved);
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

