package com.carrental.booking.service;

import com.carrental.booking.service.impl.BookingServiceImpl;

import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.booking.dto.request.BookingRequest;
import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.dto.request.BookingStatusUpdateRequest;
import com.carrental.booking.entity.Booking;
import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.enums.TripType;
import com.carrental.customer.entity.CustomerProfile;
import com.carrental.customer.repository.CustomerProfileRepository;
import com.carrental.owner.entity.OwnerProfile;
import com.carrental.owner.repository.OwnerProfileRepository;
import com.carrental.booking.mapper.BookingMapper;
import com.carrental.owner.dto.request.DriverReplacementRequest;
import com.carrental.owner.dto.request.VehicleReplacementRequest;
import com.carrental.booking.repository.BookingRepository;
import com.carrental.booking.repository.TripRepository;
import com.carrental.common.exception.BadRequestException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.notification.service.EmailService;
import com.carrental.notification.service.NotificationService;
import com.carrental.owner.repository.OwnerDriverUsageHistoryRepository;
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
    private CustomerProfileRepository customerProfileRepository;

    @Mock
    private OwnerProfileRepository ownerProfileRepository;

    @Mock
    private DriverProfileRepository driverProfileRepository;

    @Mock
    private OwnerDriverUsageHistoryRepository ownerDriverUsageHistoryRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private BookingMapper bookingMapper;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User customer;
    private CustomerProfile customerProfile;
    private User owner;
    private OwnerProfile ownerProfile;
    private User driver;
    private DriverProfile driverProfile;
    private Vehicle vehicle;
    private Booking booking;
    private BookingRequest bookingRequest;
    private BookingResponse bookingResponse;

    @BeforeEach
    void setUp() {
        customer = User.builder()
                .id(1L)
                .email("customer@test.com")
                .role(Role.CUSTOMER)
                .build();

        customerProfile = CustomerProfile.builder()
                .id(1001L)
                .user(customer)
                .build();

        owner = User.builder()
                .id(2L)
                .email("owner@test.com")
                .role(Role.OWNER)
                .build();

        ownerProfile = OwnerProfile.builder()
                .id(2001L)
                .user(owner)
                .build();

        driver = User.builder()
                .id(3L)
                .email("driver@test.com")
                .role(Role.DRIVER)
                .build();

        driverProfile = DriverProfile.builder()
                .id(300L)
                .user(driver)
                .drivingLicenseNumber("DL-12345")
                .licenseExpiryDate(LocalDate.now().plusYears(2))
                .status(DriverStatus.ACTIVE)
                .approvalStatus(ApprovalDecision.APPROVED)
                .build();

        vehicle = Vehicle.builder()
                .id(10L)
                .brand("Honda")
                .model("Civic")
                .seatingCapacity(4)
                .status(VehicleStatus.AVAILABLE)
                .approvalStatus(ApprovalDecision.APPROVED)
                .owner(ownerProfile)
                .build();

        booking = Booking.builder()
                .id(100L)
                .bookingReference("BK-TEST001")
                .customer(customerProfile)
                .vehicle(vehicle)
                .driver(driverProfile)
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
        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(customerProfile));
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
        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.createBooking(1L, bookingRequest))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("createBooking - vehicle not found")
    void testCreateBooking_VehicleNotFound() {
        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(customerProfile));
        when(vehicleRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.createBooking(1L, bookingRequest))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("createBooking - vehicle not available")
    void testCreateBooking_VehicleNotAvailable() {
        vehicle.setStatus(VehicleStatus.MAINTENANCE);
        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(customerProfile));
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> bookingService.createBooking(1L, bookingRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not available for booking");
    }

    @Test
    @DisplayName("createBooking - passenger count exceeds seating capacity")
    void testCreateBooking_PassengerCountExceedsCapacity() {
        bookingRequest.setPassengerCount(6);
        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(customerProfile));
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> bookingService.createBooking(1L, bookingRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("exceeds vehicle seating capacity");
    }

    @Test
    @DisplayName("createBooking - start date in past")
    void testCreateBooking_StartDateInPast() {
        bookingRequest.setStartDate(LocalDate.now().minusDays(1));
        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(customerProfile));
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
        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(customerProfile));
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> bookingService.createBooking(1L, bookingRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("End date cannot be before start date");
    }

    @Test
    @DisplayName("createBooking - conflicting booking exists")
    void testCreateBooking_ConflictingBooking() {
        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(customerProfile));
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
        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(customerProfile));
        when(bookingRepository.findByCustomerIdAndBookingStatusInOrderByCreatedAtDesc(eq(1001L), any()))
                .thenReturn(List.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        List<BookingResponse> list = bookingService.getCustomerBookings(1L);
        assertThat(list).hasSize(1);
    }

    @Test
    @DisplayName("getCustomerHistory - returns completed/cancelled bookings")
    void testGetCustomerHistory() {
        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(customerProfile));
        when(bookingRepository.findByCustomerIdAndBookingStatusInOrderByCreatedAtDesc(eq(1001L), any()))
                .thenReturn(List.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        List<BookingResponse> list = bookingService.getCustomerHistory(1L);
        assertThat(list).hasSize(1);
    }

    @Test
    @DisplayName("getOwnerBookings - returns owner bookings")
    void testGetOwnerBookings() {
        when(ownerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(ownerProfile));
        when(bookingRepository.findByVehicleOwnerIdOrderByCreatedAtDesc(2001L))
                .thenReturn(List.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        List<BookingResponse> list = bookingService.getOwnerBookings(2L);
        assertThat(list).hasSize(1);
    }

    @Test
    @DisplayName("getDriverBookings - returns driver bookings")
    void testGetDriverBookings() {
        when(driverProfileRepository.findByUserId(3L)).thenReturn(Optional.of(driverProfile));
        when(bookingRepository.findByDriverIdOrderByCreatedAtDesc(300L))
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
                .customer(customerProfile)
                .vehicle(vehicle)
                .driver(driverProfile)
                .status(BookingStatus.CONFIRMED)
                .build();
        BookingResponse confirmedResponse = BookingResponse.builder()
                .id(100L)
                .bookingReference("BK-TEST123")
                .status(BookingStatus.CONFIRMED)
                .driverId(300L)
                .build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(300L)).thenReturn(Optional.of(driverProfile));
        when(bookingRepository.save(any(Booking.class))).thenReturn(confirmedBooking);
        when(bookingMapper.toResponse(confirmedBooking)).thenReturn(confirmedResponse);

        BookingResponse response = bookingService.assignDriver(ownerDetails, 100L, 300L);

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

        assertThatThrownBy(() -> bookingService.assignDriver(ownerDetails, 100L, 300L))
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
        Booking rejectedBooking = Booking.builder().id(100L).status(BookingStatus.REJECTED).customer(customerProfile).build();
        BookingResponse rejectedResponse = BookingResponse.builder().id(100L).status(BookingStatus.REJECTED).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(rejectedBooking);
        when(bookingMapper.toResponse(rejectedBooking)).thenReturn(rejectedResponse);

        BookingResponse response = bookingService.updateBookingStatus(ownerDetails, 100L, request);

        assertThat(response.getStatus()).isEqualTo(BookingStatus.REJECTED);
        verify(notificationService).createNotification(eq(customer), eq("Booking Rejected"), any(), any());
    }

    @Test
    @DisplayName("cancel - customer can cancel pending booking")
    void testCancel_CustomerCanCancelPendingBooking_Success() {
        UserDetailsImpl customerDetails = UserDetailsImpl.builder().id(1L).email("customer@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))).build();
        Booking cancelledBooking = Booking.builder().id(100L).status(BookingStatus.CANCELLED).customer(customerProfile).vehicle(vehicle).build();
        BookingResponse cancelledResponse = BookingResponse.builder().id(100L).status(BookingStatus.CANCELLED).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(cancelledBooking);
        when(bookingMapper.toResponse(cancelledBooking)).thenReturn(cancelledResponse);

        BookingStatusUpdateRequest request = new BookingStatusUpdateRequest(BookingStatus.CANCELLED);
        BookingResponse response = bookingService.updateBookingStatus(customerDetails, 100L, request);

        assertThat(response.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        verify(notificationService).createNotification(eq(customer), eq("Booking Cancelled"), any(), any());
        verify(notificationService).createNotification(eq(owner), eq("Booking Cancelled by Customer"), any(), any());
    }

    @Test
    @DisplayName("cancel - customer cannot cancel confirmed booking")
    void testCancel_CustomerCannotCancelConfirmedBooking() {
        UserDetailsImpl customerDetails = UserDetailsImpl.builder().id(1L).email("customer@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))).build();
        booking.setStatus(BookingStatus.CONFIRMED);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        BookingStatusUpdateRequest request = new BookingStatusUpdateRequest(BookingStatus.CANCELLED);

        assertThatThrownBy(() -> bookingService.updateBookingStatus(customerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Customers can only cancel bookings that are in PENDING status");
    }

    @Test
    @DisplayName("cancel - customer cannot cancel another customer's booking")
    void testCancel_CustomerCannotCancelOthersBooking() {
        UserDetailsImpl customerDetails = UserDetailsImpl.builder().id(99L).email("other@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        BookingStatusUpdateRequest request = new BookingStatusUpdateRequest(BookingStatus.CANCELLED);

        assertThatThrownBy(() -> bookingService.updateBookingStatus(customerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("You are not authorized to cancel this booking");
    }

    @Test
    @DisplayName("cancel - customer cannot reject booking")
    void testCancel_CustomerCannotRejectBooking() {
        UserDetailsImpl customerDetails = UserDetailsImpl.builder().id(1L).email("customer@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        BookingStatusUpdateRequest request = new BookingStatusUpdateRequest(BookingStatus.REJECTED);

        assertThatThrownBy(() -> bookingService.updateBookingStatus(customerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Customers are only permitted to cancel bookings");
    }

    @Test
    @DisplayName("assignDriver - owner-driver can only be assigned to their own vehicles")
    void testAssignDriver_OwnerAsDriver_OnlyAllowedForOwnVehicle() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();

        User anotherOwnerDriver = User.builder()
                .id(4L)
                .email("anotherowner@test.com")
                .roles(Set.of(Role.OWNER, Role.DRIVER))
                .isActive(true)
                .build();
        DriverProfile anotherOwnerDriverProfile = DriverProfile.builder()
                .id(400L)
                .user(anotherOwnerDriver)
                .build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(400L)).thenReturn(Optional.of(anotherOwnerDriverProfile));

        assertThatThrownBy(() -> bookingService.assignDriver(ownerDetails, 100L, 400L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("An owner-driver can only be assigned to their own vehicles");
    }

    @Test
    @DisplayName("assignDriver - fails when driver approval status is PENDING (Test 5)")
    void testAssignDriver_FailsWhenDriverApprovalStatusPending() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();

        driverProfile.setApprovalStatus(ApprovalDecision.PENDING);
        driverProfile.setStatus(DriverStatus.INACTIVE);

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(300L)).thenReturn(Optional.of(driverProfile));

        assertThatThrownBy(() -> bookingService.assignDriver(ownerDetails, 100L, 300L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Driver has not been approved by admin");
    }

    @Test
    @DisplayName("assignDriver - fails when driver status is INACTIVE (Test 5)")
    void testAssignDriver_FailsWhenDriverStatusInactive() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();

        driverProfile.setApprovalStatus(ApprovalDecision.APPROVED);
        driverProfile.setStatus(DriverStatus.INACTIVE);

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(300L)).thenReturn(Optional.of(driverProfile));

        assertThatThrownBy(() -> bookingService.assignDriver(ownerDetails, 100L, 300L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Driver is inactive");
    }

    @Test
    @DisplayName("assignDriver - succeeds when driver is APPROVED and ACTIVE (Test 6)")
    void testAssignDriver_SucceedsWhenDriverApprovedAndActive() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();

        driverProfile.setApprovalStatus(ApprovalDecision.APPROVED);
        driverProfile.setStatus(DriverStatus.ACTIVE);

        Booking confirmedBooking = Booking.builder()
                .id(100L)
                .bookingReference("BK-TEST001")
                .customer(customerProfile)
                .vehicle(vehicle)
                .driver(driverProfile)
                .status(BookingStatus.CONFIRMED)
                .build();
        BookingResponse confirmedResponse = BookingResponse.builder()
                .id(100L)
                .bookingReference("BK-TEST001")
                .status(BookingStatus.CONFIRMED)
                .build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(300L)).thenReturn(Optional.of(driverProfile));
        when(bookingRepository.save(any(Booking.class))).thenReturn(confirmedBooking);
        when(bookingMapper.toResponse(confirmedBooking)).thenReturn(confirmedResponse);

        BookingResponse response = bookingService.assignDriver(ownerDetails, 100L, 300L);

        assertThat(response.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        verify(bookingRepository).save(booking);
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

    // ==========================================
    // DRIVER REPLACEMENT TESTS (Section 31)
    // ==========================================

    @Test
    @DisplayName("replaceDriver - authorized owner can replace driver successfully")
    void testReplaceDriver_AuthorizedOwner_Success() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        booking.setStatus(BookingStatus.CONFIRMED);

        User newDriver = User.builder().id(4L).email("bob@driver.com").firstName("Bob").lastName("Driver")
                .role(Role.DRIVER).isActive(true).build();
        DriverProfile newDriverProfile = DriverProfile.builder().id(400L).user(newDriver)
                .status(DriverStatus.ACTIVE).approvalStatus(ApprovalDecision.APPROVED)
                .licenseExpiryDate(LocalDate.now().plusYears(2)).build();

        DriverReplacementRequest request = DriverReplacementRequest.builder()
                .newDriverId(400L)
                .reason("Driver medical emergency")
                .build();

        Booking replacedBooking = Booking.builder().id(100L).bookingReference("BK-TEST001")
                .customer(customerProfile).vehicle(vehicle).driver(newDriverProfile).status(BookingStatus.CONFIRMED).build();
        BookingResponse replacedResponse = BookingResponse.builder().id(100L).bookingReference("BK-TEST001")
                .driverId(400L).status(BookingStatus.CONFIRMED).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(400L)).thenReturn(Optional.of(newDriverProfile));
        when(bookingRepository.save(any(Booking.class))).thenReturn(replacedBooking);
        when(bookingMapper.toResponse(replacedBooking)).thenReturn(replacedResponse);

        BookingResponse response = bookingService.replaceDriver(ownerDetails, 100L, request);

        assertThat(response.getDriverId()).isEqualTo(400L);
        assertThat(booking.getDriver()).isEqualTo(newDriverProfile);
        verify(notificationService).createNotification(eq(customer), eq("Driver Replaced"), any(), any());
        verify(notificationService).createNotification(eq(driver), eq("Trip Assignment Reassigned"), any(), any());
        verify(notificationService).createNotification(eq(newDriver), eq("New Trip Assigned"), any(), any());
        verify(emailService).sendDriverReplacementEmail(eq(replacedBooking), eq(driverProfile), eq(newDriverProfile), eq("Driver medical emergency"));
    }

    @Test
    @DisplayName("replaceDriver - unauthorized owner cannot replace driver")
    void testReplaceDriver_UnauthorizedOwner_ThrowsBadRequest() {
        UserDetailsImpl otherOwnerDetails = UserDetailsImpl.builder().id(99L).email("other@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        DriverReplacementRequest request = DriverReplacementRequest.builder().newDriverId(400L).build();

        assertThatThrownBy(() -> bookingService.replaceDriver(otherOwnerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only the vehicle owner can perform this operation on this booking");
    }

    @Test
    @DisplayName("replaceDriver - customer cannot replace driver")
    void testReplaceDriver_CustomerCannotReplace_ThrowsBadRequest() {
        UserDetailsImpl customerDetails = UserDetailsImpl.builder().id(1L).email("customer@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        DriverReplacementRequest request = DriverReplacementRequest.builder().newDriverId(400L).build();

        assertThatThrownBy(() -> bookingService.replaceDriver(customerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Customers are not permitted to assign drivers or manage owner operations");
    }

    @Test
    @DisplayName("replaceDriver - driver cannot replace driver")
    void testReplaceDriver_DriverCannotReplace_ThrowsBadRequest() {
        UserDetailsImpl driverDetails = UserDetailsImpl.builder().id(3L).email("driver@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_DRIVER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        DriverReplacementRequest request = DriverReplacementRequest.builder().newDriverId(400L).build();

        assertThatThrownBy(() -> bookingService.replaceDriver(driverDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Drivers cannot perform this action");
    }

    @Test
    @DisplayName("replaceDriver - non-existent driver rejected")
    void testReplaceDriver_NonExistentDriver_ThrowsResourceNotFound() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(999L)).thenReturn(Optional.empty());

        DriverReplacementRequest request = DriverReplacementRequest.builder().newDriverId(999L).build();

        assertThatThrownBy(() -> bookingService.replaceDriver(ownerDetails, 100L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("replaceDriver - PENDING driver rejected")
    void testReplaceDriver_PendingDriver_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        User newDriver = User.builder().id(4L).role(Role.DRIVER).isActive(true).build();
        DriverProfile pendingProfile = DriverProfile.builder().id(400L).user(newDriver)
                .status(DriverStatus.INACTIVE).approvalStatus(ApprovalDecision.PENDING).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(400L)).thenReturn(Optional.of(pendingProfile));

        DriverReplacementRequest request = DriverReplacementRequest.builder().newDriverId(400L).build();

        assertThatThrownBy(() -> bookingService.replaceDriver(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Driver has not been approved by admin (status: PENDING)");
    }

    @Test
    @DisplayName("replaceDriver - REJECTED driver rejected")
    void testReplaceDriver_RejectedDriver_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        User newDriver = User.builder().id(4L).role(Role.DRIVER).isActive(true).build();
        DriverProfile rejectedProfile = DriverProfile.builder().id(400L).user(newDriver)
                .status(DriverStatus.INACTIVE).approvalStatus(ApprovalDecision.REJECTED).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(400L)).thenReturn(Optional.of(rejectedProfile));

        DriverReplacementRequest request = DriverReplacementRequest.builder().newDriverId(400L).build();

        assertThatThrownBy(() -> bookingService.replaceDriver(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Driver has been rejected by admin");
    }

    @Test
    @DisplayName("replaceDriver - INACTIVE driver rejected")
    void testReplaceDriver_InactiveDriver_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        User newDriver = User.builder().id(4L).role(Role.DRIVER).isActive(true).build();
        DriverProfile inactiveProfile = DriverProfile.builder().id(400L).user(newDriver)
                .status(DriverStatus.INACTIVE).approvalStatus(ApprovalDecision.APPROVED).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(400L)).thenReturn(Optional.of(inactiveProfile));

        DriverReplacementRequest request = DriverReplacementRequest.builder().newDriverId(400L).build();

        assertThatThrownBy(() -> bookingService.replaceDriver(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Driver is inactive");
    }

    @Test
    @DisplayName("replaceDriver - conflicting driver rejected")
    void testReplaceDriver_ConflictingDriver_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        User newDriver = User.builder().id(4L).role(Role.DRIVER).isActive(true).build();
        DriverProfile activeProfile = DriverProfile.builder().id(400L).user(newDriver)
                .status(DriverStatus.ACTIVE).approvalStatus(ApprovalDecision.APPROVED)
                .licenseExpiryDate(LocalDate.now().plusYears(1)).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(400L)).thenReturn(Optional.of(activeProfile));
        when(bookingRepository.existsConflictingDriverBooking(eq(400L), eq(100L), any(), any())).thenReturn(true);

        DriverReplacementRequest request = DriverReplacementRequest.builder().newDriverId(400L).build();

        assertThatThrownBy(() -> bookingService.replaceDriver(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Driver has a conflicting booking during this period");
    }

    @Test
    @DisplayName("replaceDriver - same driver rejected")
    void testReplaceDriver_SameDriver_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        DriverReplacementRequest request = DriverReplacementRequest.builder().newDriverId(300L).build();

        assertThatThrownBy(() -> bookingService.replaceDriver(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Replacement driver cannot be the same as the currently assigned driver");
    }

    @Test
    @DisplayName("replaceDriver - completed or cancelled booking rejected")
    void testReplaceDriver_CancelledOrCompleted_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        booking.setStatus(BookingStatus.CANCELLED);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        DriverReplacementRequest request = DriverReplacementRequest.builder().newDriverId(400L).build();

        assertThatThrownBy(() -> bookingService.replaceDriver(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Driver replacement is not allowed for CANCELLED bookings");
    }

    @Test
    @DisplayName("replaceDriver - during ongoing trip updates driver status correctly")
    void testReplaceDriver_DuringTrip_PreservesTripLifecycle() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        booking.setStatus(BookingStatus.IN_PROGRESS);
        driverProfile.setStatus(DriverStatus.ON_TRIP);

        User newDriver = User.builder().id(4L).email("bob@driver.com").firstName("Bob").lastName("Driver")
                .role(Role.DRIVER).isActive(true).build();
        DriverProfile newDriverProfile = DriverProfile.builder().id(400L).user(newDriver)
                .status(DriverStatus.ACTIVE).approvalStatus(ApprovalDecision.APPROVED)
                .licenseExpiryDate(LocalDate.now().plusYears(2)).build();

        DriverReplacementRequest request = DriverReplacementRequest.builder().newDriverId(400L).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(400L)).thenReturn(Optional.of(newDriverProfile));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        bookingService.replaceDriver(ownerDetails, 100L, request);

        assertThat(driverProfile.getStatus()).isEqualTo(DriverStatus.ACTIVE);
        assertThat(newDriverProfile.getStatus()).isEqualTo(DriverStatus.ON_TRIP);
        assertThat(booking.getDriver()).isEqualTo(newDriverProfile);
    }

    // ==========================================
    // VEHICLE REPLACEMENT TESTS (Section 32)
    // ==========================================

    @Test
    @DisplayName("replaceVehicle - authorized owner replaces vehicle successfully")
    void testReplaceVehicle_AuthorizedOwner_Success() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        booking.setStatus(BookingStatus.CONFIRMED);

        Vehicle newVehicle = Vehicle.builder().id(20L).brand("Toyota").model("Camry").licensePlate("MH12CD5678")
                .owner(ownerProfile).status(VehicleStatus.AVAILABLE).approvalStatus(ApprovalDecision.APPROVED)
                .seatingCapacity(4).build();

        VehicleReplacementRequest request = VehicleReplacementRequest.builder()
                .newVehicleId(20L)
                .reason("Vehicle mechanical issue")
                .build();

        Booking replacedBooking = Booking.builder().id(100L).bookingReference("BK-TEST001")
                .customer(customerProfile).vehicle(newVehicle).driver(driverProfile).status(BookingStatus.CONFIRMED).build();
        BookingResponse replacedResponse = BookingResponse.builder().id(100L).bookingReference("BK-TEST001")
                .vehicleId(20L).status(BookingStatus.CONFIRMED).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(vehicleRepository.findById(20L)).thenReturn(Optional.of(newVehicle));
        when(bookingRepository.save(any(Booking.class))).thenReturn(replacedBooking);
        when(bookingMapper.toResponse(replacedBooking)).thenReturn(replacedResponse);

        BookingResponse response = bookingService.replaceVehicle(ownerDetails, 100L, request);

        assertThat(response.getVehicleId()).isEqualTo(20L);
        assertThat(booking.getVehicle()).isEqualTo(newVehicle);
        verify(notificationService).createNotification(eq(customer), eq("Vehicle Replaced"), any(), any());
        verify(notificationService).createNotification(eq(driver), eq("Vehicle Updated for Trip"), any(), any());
        verify(emailService).sendVehicleReplacementEmail(eq(replacedBooking), eq(vehicle), eq(newVehicle), eq("Vehicle mechanical issue"));
    }

    @Test
    @DisplayName("replaceVehicle - unauthorized owner cannot replace vehicle")
    void testReplaceVehicle_UnauthorizedOwner_ThrowsBadRequest() {
        UserDetailsImpl otherOwnerDetails = UserDetailsImpl.builder().id(99L).email("other@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        VehicleReplacementRequest request = VehicleReplacementRequest.builder().newVehicleId(20L).build();

        assertThatThrownBy(() -> bookingService.replaceVehicle(otherOwnerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only the vehicle owner can perform this operation on this booking");
    }

    @Test
    @DisplayName("replaceVehicle - non-existent vehicle rejected")
    void testReplaceVehicle_NonExistentVehicle_ThrowsResourceNotFound() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        VehicleReplacementRequest request = VehicleReplacementRequest.builder().newVehicleId(999L).build();

        assertThatThrownBy(() -> bookingService.replaceVehicle(ownerDetails, 100L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("replaceVehicle - PENDING vehicle rejected")
    void testReplaceVehicle_PendingVehicle_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        Vehicle pendingVehicle = Vehicle.builder().id(20L).owner(ownerProfile).approvalStatus(ApprovalDecision.PENDING)
                .status(VehicleStatus.INACTIVE).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(vehicleRepository.findById(20L)).thenReturn(Optional.of(pendingVehicle));

        VehicleReplacementRequest request = VehicleReplacementRequest.builder().newVehicleId(20L).build();

        assertThatThrownBy(() -> bookingService.replaceVehicle(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Vehicle is pending admin approval");
    }

    @Test
    @DisplayName("replaceVehicle - REJECTED vehicle rejected")
    void testReplaceVehicle_RejectedVehicle_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        Vehicle rejectedVehicle = Vehicle.builder().id(20L).owner(ownerProfile).approvalStatus(ApprovalDecision.REJECTED)
                .status(VehicleStatus.INACTIVE).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(vehicleRepository.findById(20L)).thenReturn(Optional.of(rejectedVehicle));

        VehicleReplacementRequest request = VehicleReplacementRequest.builder().newVehicleId(20L).build();

        assertThatThrownBy(() -> bookingService.replaceVehicle(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Vehicle has been rejected by admin");
    }

    @Test
    @DisplayName("replaceVehicle - MAINTENANCE vehicle rejected")
    void testReplaceVehicle_MaintenanceVehicle_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        Vehicle maintenanceVehicle = Vehicle.builder().id(20L).owner(ownerProfile).approvalStatus(ApprovalDecision.APPROVED)
                .status(VehicleStatus.MAINTENANCE).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(vehicleRepository.findById(20L)).thenReturn(Optional.of(maintenanceVehicle));

        VehicleReplacementRequest request = VehicleReplacementRequest.builder().newVehicleId(20L).build();

        assertThatThrownBy(() -> bookingService.replaceVehicle(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Vehicle is under maintenance");
    }

    @Test
    @DisplayName("replaceVehicle - conflicting vehicle rejected")
    void testReplaceVehicle_ConflictingVehicle_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        Vehicle availableVehicle = Vehicle.builder().id(20L).owner(ownerProfile).approvalStatus(ApprovalDecision.APPROVED)
                .status(VehicleStatus.AVAILABLE).seatingCapacity(4).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(vehicleRepository.findById(20L)).thenReturn(Optional.of(availableVehicle));
        when(bookingRepository.existsConflictingVehicleBooking(eq(20L), eq(100L), any(), any())).thenReturn(true);

        VehicleReplacementRequest request = VehicleReplacementRequest.builder().newVehicleId(20L).build();

        assertThatThrownBy(() -> bookingService.replaceVehicle(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Vehicle has a conflicting booking during this period");
    }

    @Test
    @DisplayName("replaceVehicle - same vehicle rejected")
    void testReplaceVehicle_SameVehicle_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        VehicleReplacementRequest request = VehicleReplacementRequest.builder().newVehicleId(10L).build();

        assertThatThrownBy(() -> bookingService.replaceVehicle(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Replacement vehicle cannot be the same as the currently assigned vehicle");
    }

    @Test
    @DisplayName("replaceVehicle - vehicle from different owner fleet rejected")
    void testReplaceVehicle_DifferentOwnerFleet_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        OwnerProfile anotherOwnerProfile = OwnerProfile.builder()
                .id(9990L)
                .user(User.builder().id(99L).email("anotherowner@test.com").build())
                .build();
        Vehicle differentOwnerVehicle = Vehicle.builder().id(20L).owner(anotherOwnerProfile).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(vehicleRepository.findById(20L)).thenReturn(Optional.of(differentOwnerVehicle));

        VehicleReplacementRequest request = VehicleReplacementRequest.builder().newVehicleId(20L).build();

        assertThatThrownBy(() -> bookingService.replaceVehicle(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Replacement vehicle must belong to your fleet");
    }

    @Test
    @DisplayName("replaceVehicle - vehicle with insufficient seating capacity rejected")
    void testReplaceVehicle_InsufficientCapacity_ThrowsBadRequest() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        booking.setPassengerCount(3);
        Vehicle smallVehicle = Vehicle.builder().id(20L).owner(ownerProfile).approvalStatus(ApprovalDecision.APPROVED)
                .status(VehicleStatus.AVAILABLE).seatingCapacity(2).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(vehicleRepository.findById(20L)).thenReturn(Optional.of(smallVehicle));

        VehicleReplacementRequest request = VehicleReplacementRequest.builder().newVehicleId(20L).build();

        assertThatThrownBy(() -> bookingService.replaceVehicle(ownerDetails, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Replacement vehicle seating capacity (2) is less than required passenger count (3)");
    }

    @Test
    @DisplayName("replaceVehicle - during trip sets new vehicle to ON_TRIP and old to AVAILABLE")
    void testReplaceVehicle_DuringTrip_SetsNewVehicleOnTrip() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();
        booking.setStatus(BookingStatus.IN_PROGRESS);
        vehicle.setStatus(VehicleStatus.ON_TRIP);

        Vehicle newVehicle = Vehicle.builder().id(20L).brand("Toyota").model("Camry").licensePlate("MH12CD5678")
                .owner(ownerProfile).status(VehicleStatus.AVAILABLE).approvalStatus(ApprovalDecision.APPROVED)
                .seatingCapacity(4).build();

        VehicleReplacementRequest request = VehicleReplacementRequest.builder().newVehicleId(20L).build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(vehicleRepository.findById(20L)).thenReturn(Optional.of(newVehicle));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        bookingService.replaceVehicle(ownerDetails, 100L, request);

        assertThat(vehicle.getStatus()).isEqualTo(VehicleStatus.AVAILABLE);
        assertThat(newVehicle.getStatus()).isEqualTo(VehicleStatus.ON_TRIP);
        assertThat(booking.getVehicle()).isEqualTo(newVehicle);
    }

    // ==========================================
    // ID COLLISION REGRESSION TESTS (Section 13)
    // ==========================================

    @Test
    @DisplayName("ID Collision: Driver assignment uses DriverProfile.id=1 (User.id=4) and never resolves via userRepository")
    void testDriverAssignment_IdCollision_UsesDriverProfileIdAndNeverUserRepository() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();

        // User.id = 4 has DriverProfile.id = 1
        User user4 = User.builder().id(4L).email("driver4@test.com").role(Role.DRIVER).isActive(true).build();
        DriverProfile profile1 = DriverProfile.builder()
                .id(1L)
                .user(user4)
                .status(DriverStatus.ACTIVE)
                .approvalStatus(ApprovalDecision.APPROVED)
                .licenseExpiryDate(LocalDate.now().plusYears(1))
                .build();

        Booking confirmedBooking = Booking.builder()
                .id(100L)
                .bookingReference("BK-TEST-COLLISION")
                .customer(customerProfile)
                .vehicle(vehicle)
                .driver(profile1)
                .status(BookingStatus.CONFIRMED)
                .build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(1L)).thenReturn(Optional.of(profile1));
        when(bookingRepository.save(any(Booking.class))).thenReturn(confirmedBooking);
        when(bookingMapper.toResponse(confirmedBooking)).thenReturn(bookingResponse);

        // Assign driver using driverId = 1 (DriverProfile.id)
        BookingResponse response = bookingService.assignDriver(ownerDetails, 100L, 1L);

        assertThat(response).isNotNull();
        // Verify driverProfileRepository.findById(1L) was called
        verify(driverProfileRepository).findById(1L);
        // Verify userRepository.findById(1L) was NEVER invoked
        verify(userRepository, never()).findById(1L);
        // Verify assigned driver is profile1
        assertThat(booking.getDriver()).isEqualTo(profile1);
        assertThat(booking.getDriver().getId()).isEqualTo(1L);
        assertThat(booking.getDriver().getUser().getId()).isEqualTo(4L);
    }

    @Test
    @DisplayName("ID Collision: Driver assignment uses DriverProfile.id=4 (User.id=1) and never resolves via userRepository")
    void testDriverAssignment_IdCollision_UsesDriverProfileId4AndNeverUserRepository() {
        UserDetailsImpl ownerDetails = UserDetailsImpl.builder().id(2L).email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))).build();

        // User.id = 1 has DriverProfile.id = 4
        User user1 = User.builder().id(1L).email("driver1@test.com").role(Role.DRIVER).isActive(true).build();
        DriverProfile profile4 = DriverProfile.builder()
                .id(4L)
                .user(user1)
                .status(DriverStatus.ACTIVE)
                .approvalStatus(ApprovalDecision.APPROVED)
                .licenseExpiryDate(LocalDate.now().plusYears(1))
                .build();

        Booking confirmedBooking = Booking.builder()
                .id(100L)
                .bookingReference("BK-TEST-COLLISION2")
                .customer(customerProfile)
                .vehicle(vehicle)
                .driver(profile4)
                .status(BookingStatus.CONFIRMED)
                .build();

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(driverProfileRepository.findById(4L)).thenReturn(Optional.of(profile4));
        when(bookingRepository.save(any(Booking.class))).thenReturn(confirmedBooking);
        when(bookingMapper.toResponse(confirmedBooking)).thenReturn(bookingResponse);

        // Assign driver using driverId = 4 (DriverProfile.id)
        BookingResponse response = bookingService.assignDriver(ownerDetails, 100L, 4L);

        assertThat(response).isNotNull();
        verify(driverProfileRepository).findById(4L);
        verify(userRepository, never()).findById(4L);
        assertThat(booking.getDriver()).isEqualTo(profile4);
        assertThat(booking.getDriver().getId()).isEqualTo(4L);
        assertThat(booking.getDriver().getUser().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("ID Collision: createBooking boundary converts customerId (User.id=10) to CustomerProfile.id=20")
    void testCreateBooking_IdCollision_ConvertsUserIdToProfileId() {
        User user10 = User.builder().id(10L).email("customer10@test.com").role(Role.CUSTOMER).build();
        CustomerProfile profile20 = CustomerProfile.builder().id(20L).user(user10).build();

        when(customerProfileRepository.findByUserId(10L)).thenReturn(Optional.of(profile20));
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.existsConflictingBooking(10L, bookingRequest.getStartDate(), bookingRequest.getEndDate())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(bookingResponse);

        BookingResponse response = bookingService.createBooking(10L, bookingRequest);

        assertThat(response).isNotNull();
        verify(customerProfileRepository).findByUserId(10L);
        verify(userRepository, never()).findById(10L);
    }

    @Test
    @DisplayName("ID Collision: getOwnerBookings boundary converts ownerId (User.id=5) to OwnerProfile.id=15")
    void testGetOwnerBookings_IdCollision_ConvertsUserIdToProfileId() {
        User user5 = User.builder().id(5L).email("owner5@test.com").role(Role.OWNER).build();
        OwnerProfile profile15 = OwnerProfile.builder().id(15L).user(user5).build();

        when(ownerProfileRepository.findByUserId(5L)).thenReturn(Optional.of(profile15));
        when(bookingRepository.findByVehicleOwnerIdOrderByCreatedAtDesc(15L)).thenReturn(List.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        List<BookingResponse> list = bookingService.getOwnerBookings(5L);

        assertThat(list).hasSize(1);
        verify(ownerProfileRepository).findByUserId(5L);
        verify(bookingRepository).findByVehicleOwnerIdOrderByCreatedAtDesc(15L);
    }
}

