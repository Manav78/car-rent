package com.carrental.booking.service;

import com.carrental.booking.service.impl.BookingServiceImpl;

import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.booking.dto.request.BookingRequest;
import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.dto.request.BookingStatusUpdateRequest;
import com.carrental.booking.entity.Booking;
import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.enums.TripType;
import com.carrental.booking.mapper.BookingMapper;
import com.carrental.booking.repository.BookingRepository;
import com.carrental.common.exception.BadRequestException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.notification.service.EmailService;
import com.carrental.notification.service.NotificationService;
import com.carrental.security.service.UserDetailsImpl;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DriverProfileRepository driverProfileRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private BookingMapper bookingMapper;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User customer;
    private User owner;
    private User driver;
    private Vehicle vehicle;
    private Booking booking;
    private BookingRequest bookingRequest;
    private BookingResponse bookingResponse;

    @BeforeEach
    void setUp() {
        customer = User.builder()
                .id(1L)
                .email("customer@test.com")
                .role(Role.ROLE_CUSTOMER)
                .build();

        owner = User.builder()
                .id(2L)
                .email("owner@test.com")
                .role(Role.ROLE_OWNER)
                .build();

        driver = User.builder()
                .id(3L)
                .email("driver@test.com")
                .role(Role.ROLE_DRIVER)
                .build();

        vehicle = Vehicle.builder()
                .id(10L)
                .brand("Honda")
                .model("Civic")
                .seatingCapacity(4)
                .status(VehicleStatus.AVAILABLE)
                .approvalStatus("APPROVED")
                .owner(owner)
                .build();

        booking = Booking.builder()
                .id(100L)
                .bookingReference("BK-TEST001")
                .customer(customer)
                .vehicle(vehicle)
                .driver(driver)
                .startDate(LocalDate.now().plusDays(2))
                .endDate(LocalDate.now().plusDays(5))
                .status(BookingStatus.PENDING)
                .build();

        bookingRequest = BookingRequest.builder()
                .vehicleId(10L)
                .startDate(LocalDate.now().plusDays(2))
                .endDate(LocalDate.now().plusDays(5))
                .pickupLocation("City Center")
                .dropoffLocation("Airport")
                .customerPhoneNumber("1234567890")
                .tripType(TripType.LOCAL)
                .passengerCount(3)
                .build();

        bookingResponse = BookingResponse.builder()
                .id(100L)
                .bookingReference("BK-TEST001")
                .status(BookingStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("createBooking - success")
    void testCreateBooking_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.existsConflictingBooking(10L, bookingRequest.getStartDate(), bookingRequest.getEndDate())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        BookingResponse response = bookingService.createBooking(1L, bookingRequest);

        assertThat(response).isNotNull();
        assertThat(response.getBookingReference()).isEqualTo("BK-TEST001");
        verify(bookingRepository).save(any(Booking.class));
        verify(notificationService).createNotification(eq(customer), any(), any(), any());
        verify(notificationService).createNotification(eq(owner), any(), any(), any());
    }

    @Test
    @DisplayName("createBooking - customer not found")
    void testCreateBooking_CustomerNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.createBooking(1L, bookingRequest))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("createBooking - vehicle not found")
    void testCreateBooking_VehicleNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.createBooking(1L, bookingRequest))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("createBooking - vehicle not available")
    void testCreateBooking_VehicleNotAvailable() {
        vehicle.setStatus(VehicleStatus.MAINTENANCE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> bookingService.createBooking(1L, bookingRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not available for booking");
    }

    @Test
    @DisplayName("createBooking - passenger count exceeds seating capacity")
    void testCreateBooking_PassengerCountExceedsCapacity() {
        bookingRequest.setPassengerCount(6);
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> bookingService.createBooking(1L, bookingRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("exceeds vehicle seating capacity");
    }

    @Test
    @DisplayName("createBooking - start date in past")
    void testCreateBooking_StartDateInPast() {
        bookingRequest.setStartDate(LocalDate.now().minusDays(1));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> bookingService.createBooking(1L, bookingRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Start date cannot be in the past");
    }

    @Test
    @DisplayName("createBooking - end date before start date")
    void testCreateBooking_EndDateBeforeStartDate() {
        bookingRequest.setStartDate(LocalDate.now().plusDays(5));
        bookingRequest.setEndDate(LocalDate.now().plusDays(2));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> bookingService.createBooking(1L, bookingRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("End date cannot be before start date");
    }

    @Test
    @DisplayName("createBooking - conflicting booking exists")
    void testCreateBooking_ConflictingBooking() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.existsConflictingBooking(10L, bookingRequest.getStartDate(), bookingRequest.getEndDate())).thenReturn(true);

        assertThatThrownBy(() -> bookingService.createBooking(1L, bookingRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already booked");
    }

    @Test
    @DisplayName("getBookingById - success")
    void testGetBookingById_Success() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        BookingResponse response = bookingService.getBookingById(100L);
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("getBookingById - not found")
    void testGetBookingById_NotFound() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getBookingById(100L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("getBookingById with userDetails - admin can access any booking")
    void testGetBookingById_AdminAccess() {
        UserDetailsImpl adminDetails = UserDetailsImpl.builder().id(99L).email("admin@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        BookingResponse response = bookingService.getBookingById(adminDetails, 100L);
        assertThat(response).isNotNull();
    }

    @Test
    @DisplayName("getBookingById with userDetails - customer who booked can access")
    void testGetBookingById_CustomerAccess() {
        UserDetailsImpl customerDetails = UserDetailsImpl.builder().id(1L).email("customer@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        BookingResponse response = bookingService.getBookingById(customerDetails, 100L);
        assertThat(response).isNotNull();
    }

    @Test
    @DisplayName("getBookingById with userDetails - vehicle owner can access")
    void testGetBookingById_OwnerAccess() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        BookingResponse response = bookingService.getBookingById(ownerDetails, 100L);
        assertThat(response).isNotNull();
    }

    @Test
    @DisplayName("getBookingById with userDetails - assigned driver can access")
    void testGetBookingById_DriverAccess() {
        UserDetailsImpl driverDetails = UserDetailsImpl.builder().id(3L).email("driver@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_DRIVER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        BookingResponse response = bookingService.getBookingById(driverDetails, 100L);
        assertThat(response).isNotNull();
    }

    @Test
    @DisplayName("getBookingById with userDetails - unauthorized user access denied")
    void testGetBookingById_UnauthorizedAccess() {
        UserDetailsImpl otherDetails = UserDetailsImpl.builder().id(999L).email("other@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.getBookingById(otherDetails, 100L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("do not have permission");
    }

    @Test
    @DisplayName("getCustomerBookings - returns active bookings")
    void testGetCustomerBookings() {
        when(bookingRepository.findByCustomerIdAndBookingStatusInOrderByCreatedAtDesc(eq(1L), any()))
                .thenReturn(List.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        List<BookingResponse> list = bookingService.getCustomerBookings(1L);
        assertThat(list).hasSize(1);
    }

    @Test
    @DisplayName("getCustomerHistory - returns completed/cancelled bookings")
    void testGetCustomerHistory() {
        when(bookingRepository.findByCustomerIdAndBookingStatusInOrderByCreatedAtDesc(eq(1L), any()))
                .thenReturn(List.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        List<BookingResponse> list = bookingService.getCustomerHistory(1L);
        assertThat(list).hasSize(1);
    }

    @Test
    @DisplayName("getOwnerBookings - returns owner bookings")
    void testGetOwnerBookings() {
        when(bookingRepository.findByVehicleOwnerIdOrderByCreatedAtDesc(2L))
                .thenReturn(List.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        List<BookingResponse> list = bookingService.getOwnerBookings(2L);
        assertThat(list).hasSize(1);
    }

    @Test
    @DisplayName("getDriverBookings - returns driver bookings")
    void testGetDriverBookings() {
        when(bookingRepository.findByDriverIdOrderByCreatedAtDesc(3L))
                .thenReturn(List.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        List<BookingResponse> list = bookingService.getDriverBookings(3L);
        assertThat(list).hasSize(1);
    }

    @Test
    @DisplayName("updateBookingStatus - rejects CONFIRMED status directly (must use assign-driver)")
    void testUpdateBookingStatus_Confirmed_ThrowsBadRequest() {
        BookingStatusUpdateRequest request = new BookingStatusUpdateRequest(BookingStatus.CONFIRMED);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.updateBookingStatus(100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Bookings cannot be confirmed directly via status update");
    }

    @Test
    @DisplayName("updateBookingStatus - to cancelled does not send confirmation email")
    void testUpdateBookingStatus_Cancelled() {
        BookingStatusUpdateRequest request = new BookingStatusUpdateRequest(BookingStatus.CANCELLED);
        Booking cancelledBooking = Booking.builder()
                .id(100L)
                .status(BookingStatus.CANCELLED)
                .build();
        BookingResponse cancelledResponse = BookingResponse.builder()
                .id(100L)
                .status(BookingStatus.CANCELLED)
                .build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(cancelledBooking);
        when(bookingMapper.toResponse(cancelledBooking)).thenReturn(cancelledResponse);

        BookingResponse response = bookingService.updateBookingStatus(100L, request);

        assertThat(response.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        verify(emailService, never()).sendBookingConfirmationEmail(any());
    }

    @Test
    @DisplayName("assignDriver - owner successfully assigns driver and atomically confirms pending booking")
    void testAssignDriver_Success() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        Booking confirmedBooking = Booking.builder()
                .id(100L)
                .bookingReference("BK-TEST123")
                .customer(customer)
                .vehicle(vehicle)
                .driver(driver)
                .status(BookingStatus.CONFIRMED)
                .build();
        BookingResponse confirmedResponse = BookingResponse.builder()
                .id(100L)
                .bookingReference("BK-TEST123")
                .status(BookingStatus.CONFIRMED)
                .driverId(3L)
                .build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(userRepository.findById(3L)).thenReturn(Optional.of(driver));
        when(bookingRepository.save(any(Booking.class))).thenReturn(confirmedBooking);
        when(bookingMapper.toResponse(confirmedBooking)).thenReturn(confirmedResponse);

        BookingResponse response = bookingService.assignDriver(ownerDetails, 100L, 3L);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        verify(bookingRepository).save(booking);
        verify(emailService).sendBookingConfirmationEmail(confirmedBooking);
        verify(notificationService).createNotification(eq(customer), eq("Booking Confirmed"), any(), any());
        verify(notificationService).createNotification(eq(driver), eq("New Trip Assigned"), any(), any());
    }

    @Test
    @DisplayName("assignDriver - fails if booking is not in PENDING status")
    void testAssignDriver_NotPending_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        booking.setStatus(BookingStatus.CONFIRMED);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.assignDriver(ownerDetails, 100L, 3L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Driver can only be assigned to a booking in PENDING status");
    }

    @Test
    @DisplayName("reject - fails if rejection reason is missing")
    void testReject_WithoutReason_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        BookingStatusUpdateRequest request = new BookingStatusUpdateRequest(BookingStatus.REJECTED);

        assertThatThrownBy(() -> bookingService.updateBookingStatus(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Rejection reason is mandatory when rejecting a booking");
    }

    @Test
    @DisplayName("reject - success with mandatory reason")
    void testReject_WithReason_Success() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        BookingStatusUpdateRequest request = BookingStatusUpdateRequest.builder()
                .status(BookingStatus.REJECTED)
                .reason("Vehicle unavailable")
                .build();
        Booking rejectedBooking = Booking.builder().id(100L).status(BookingStatus.REJECTED).customer(customer).build();
        BookingResponse rejectedResponse = BookingResponse.builder().id(100L).status(BookingStatus.REJECTED).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(rejectedBooking);
        when(bookingMapper.toResponse(rejectedBooking)).thenReturn(rejectedResponse);

        BookingResponse response = bookingService.updateBookingStatus(ownerDetails, 100L, request);

        assertThat(response.getStatus()).isEqualTo(BookingStatus.REJECTED);
        verify(notificationService).createNotification(eq(customer), eq("Booking Rejected"), any(), any());
    }

    @Test
    @DisplayName("cancel - customer is forbidden from cancelling")
    void testCancel_CustomerForbidden() {
        UserDetailsImpl customerDetails = UserDetailsImpl.builder().id(1L).email("customer@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        BookingStatusUpdateRequest request = new BookingStatusUpdateRequest(BookingStatus.CANCELLED);

        assertThatThrownBy(() -> bookingService.updateBookingStatus(customerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Customers are not permitted to change booking status or cancel bookings");
    }

    @Test
    @DisplayName("driver trip - driver cannot confirm, reject, or cancel")
    void testDriverTrip_DriverCannotConfirmOrRejectOrCancel() {
        UserDetailsImpl driverDetails = UserDetailsImpl.builder().id(3L).email("driver@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_DRIVER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        BookingStatusUpdateRequest request = new BookingStatusUpdateRequest(BookingStatus.CONFIRMED);

        assertThatThrownBy(() -> bookingService.updateDriverTripStatus(driverDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Drivers cannot confirm, reject, or cancel bookings");
    }

    @Test
    @DisplayName("driver trip - driver can start and complete trip")
    void testDriverTrip_StartAndComplete() {
        UserDetailsImpl driverDetails = UserDetailsImpl.builder().id(3L).email("driver@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_DRIVER"))).build();
        booking.setStatus(BookingStatus.CONFIRMED);
        Booking inProgressBooking = Booking.builder().id(100L).status(BookingStatus.IN_PROGRESS).build();
        BookingResponse inProgressResponse = BookingResponse.builder().id(100L).status(BookingStatus.IN_PROGRESS).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(inProgressBooking);
        when(bookingMapper.toResponse(inProgressBooking)).thenReturn(inProgressResponse);

        BookingStatusUpdateRequest startRequest = new BookingStatusUpdateRequest(BookingStatus.IN_PROGRESS);
        BookingResponse startResponse = bookingService.updateDriverTripStatus(driverDetails, 100L, startRequest);

        assertThat(startResponse.getStatus()).isEqualTo(BookingStatus.IN_PROGRESS);
    }
}

