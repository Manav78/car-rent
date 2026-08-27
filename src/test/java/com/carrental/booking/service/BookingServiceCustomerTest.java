package com.carrental.booking.service;

import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.booking.dto.BookingRequest;
import com.carrental.booking.dto.BookingResponse;
import com.carrental.booking.entity.Booking;
import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.enums.PaymentStatus;
import com.carrental.booking.enums.TripType;
import com.carrental.booking.mapper.BookingMapper;
import com.carrental.booking.repository.BookingRepository;
import com.carrental.common.exception.BadRequestException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.notification.service.EmailService;
import com.carrental.notification.service.NotificationService;
import com.carrental.security.service.UserDetailsImpl;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.enums.FuelType;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.enums.VehicleType;
import com.carrental.vehicle.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceCustomerTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    private BookingMapper bookingMapper = Mappers.getMapper(BookingMapper.class);

    private BookingServiceImpl bookingService;

    private User customer;
    private User otherCustomer;
    private User owner;
    private User driver;
    private Vehicle vehicle;
    private BookingRequest bookingRequest;
    private Booking sampleBooking;

    private UserDetailsImpl customerUserDetails;
    private UserDetailsImpl otherCustomerUserDetails;
    private UserDetailsImpl ownerUserDetails;
    private UserDetailsImpl adminUserDetails;

    @BeforeEach
    void setUp() {
        bookingService = new BookingServiceImpl(
                bookingRepository,
                vehicleRepository,
                userRepository,
                notificationService,
                emailService,
                bookingMapper
        );

        customer = User.builder()
                .id(1L)
                .firstName("Alice")
                .lastName("Customer")
                .email("alice@example.com")
                .phoneNumber("+1111111111")
                .role(Role.ROLE_CUSTOMER)
                .build();

        otherCustomer = User.builder()
                .id(2L)
                .firstName("Bob")
                .lastName("Customer")
                .email("bob@example.com")
                .phoneNumber("+2222222222")
                .role(Role.ROLE_CUSTOMER)
                .build();

        owner = User.builder()
                .id(3L)
                .firstName("Charlie")
                .lastName("Owner")
                .email("charlie@example.com")
                .phoneNumber("+3333333333")
                .role(Role.ROLE_OWNER)
                .build();

        driver = User.builder()
                .id(4L)
                .firstName("Dan")
                .lastName("Driver")
                .email("dan@example.com")
                .phoneNumber("+4444444444")
                .role(Role.ROLE_DRIVER)
                .build();

        vehicle = Vehicle.builder()
                .id(100L)
                .owner(owner)
                .brand("Toyota")
                .model("Camry")
                .year(2023)
                .licensePlate("ABC-123")
                .pricePerKm(15)
                .seatingCapacity(5)
                .vehicleType(VehicleType.SEDAN)
                .fuelType(FuelType.PETROL)
                .status(VehicleStatus.AVAILABLE)
                .location("New York")
                .imageUrls(List.of("http://example.com/img1.jpg"))
                .build();

        bookingRequest = BookingRequest.builder()
                .vehicleId(100L)
                .startDate(LocalDate.now().plusDays(2))
                .endDate(LocalDate.now().plusDays(5))
                .pickupLocation("Downtown NY")
                .dropoffLocation("Uptown NY")
                .customerPhoneNumber("+1111111111")
                .tripType(TripType.LOCAL)
                .passengerCount(4)
                .notes("Need clean car")
                .build();

        sampleBooking = Booking.builder()
                .id(500L)
                .bookingReference("BK-TEST1234")
                .customer(customer)
                .vehicle(vehicle)
                .driver(null)
                .startDate(LocalDate.now().plusDays(2))
                .endDate(LocalDate.now().plusDays(5))
                .pickupLocation("Downtown NY")
                .dropoffLocation("Uptown NY")
                .customerPhoneNumber("+1111111111")
                .tripType(TripType.LOCAL)
                .passengerCount(4)
                .finalAgreedAmount(null)
                .rejectionReason(null)
                .bookingStatus(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .notes("Need clean car")
                .createdAt(LocalDateTime.now())
                .build();

        customerUserDetails = UserDetailsImpl.builder()
                .id(1L)
                .email("alice@example.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .build();

        otherCustomerUserDetails = UserDetailsImpl.builder()
                .id(2L)
                .email("bob@example.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .build();

        ownerUserDetails = UserDetailsImpl.builder()
                .id(3L)
                .email("charlie@example.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER")))
                .build();

        adminUserDetails = UserDetailsImpl.builder()
                .id(99L)
                .email("admin@example.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();
    }

    @Test
    @DisplayName("Should successfully create a customer booking request")
    void testCreateBookingSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.existsConflictingBooking(eq(100L), any(LocalDate.class), any(LocalDate.class))).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> {
            Booking b = i.getArgument(0);
            b.setId(501L);
            return b;
        });

        BookingResponse response = bookingService.createBooking(1L, bookingRequest);

        assertNotNull(response);
        assertEquals(1L, response.getCustomerId());
        assertEquals("Alice Customer", response.getCustomerName());
        assertEquals(100L, response.getVehicleId());
        assertEquals("Toyota Camry", response.getVehicleName());
        assertEquals("Downtown NY", response.getPickupLocation());
        assertEquals("Uptown NY", response.getDropoffLocation());
        assertEquals(BookingStatus.PENDING, response.getBookingStatus());
        assertEquals(PaymentStatus.PENDING, response.getPaymentStatus());
        assertNull(response.getDriverId());
        assertNull(response.getFinalAgreedAmount());
        assertNull(response.getRejectionReason());
        assertNotNull(response.getBookingReference());
        assertTrue(response.getBookingReference().startsWith("BK-"));

        verify(bookingRepository).save(argThat(b -> "Downtown NY".equals(b.getPickupLocation()) && "Uptown NY".equals(b.getDropoffLocation())));
        verify(notificationService).createNotification(eq(customer), anyString(), anyString(), any());
        verify(notificationService).createNotification(eq(owner), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("Should verify that dropoffLocation from BookingRequest is saved in Booking entity and returned in BookingResponse")
    void testBookingCreationPersistsDropoffLocation() {
        BookingRequest request = BookingRequest.builder()
                .vehicleId(100L)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(3))
                .pickupLocation("Pune")
                .dropoffLocation("Mumbai Airport")
                .customerPhoneNumber("9123456789")
                .tripType(TripType.OUTSTATION)
                .passengerCount(4)
                .notes("Pickup at 10 AM")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.existsConflictingBooking(eq(100L), any(LocalDate.class), any(LocalDate.class))).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> {
            Booking b = i.getArgument(0);
            b.setId(600L);
            return b;
        });

        BookingResponse response = bookingService.createBooking(1L, request);

        assertNotNull(response);
        assertEquals("Pune", response.getPickupLocation());
        assertEquals("Mumbai Airport", response.getDropoffLocation());
        assertEquals("9123456789", response.getCustomerPhoneNumber());
        assertEquals(TripType.OUTSTATION, response.getTripType());
        assertEquals(4, response.getPassengerCount());

        verify(bookingRepository).save(argThat(b ->
                "Pune".equals(b.getPickupLocation()) &&
                "Mumbai Airport".equals(b.getDropoffLocation()) &&
                "9123456789".equals(b.getCustomerPhoneNumber()) &&
                Integer.valueOf(4).equals(b.getPassengerCount())
        ));
    }

    @Test
    @DisplayName("Should verify that passengerCount is persisted in Booking entity and returned in BookingResponse")
    void testBookingCreationPersistsPassengerCount() {
        BookingRequest request = BookingRequest.builder()
                .vehicleId(100L)
                .startDate(LocalDate.now().plusDays(2))
                .endDate(LocalDate.now().plusDays(4))
                .pickupLocation("Pune")
                .dropoffLocation("Mumbai Airport")
                .customerPhoneNumber("9876543210")
                .tripType(TripType.OUTSTATION)
                .passengerCount(4)
                .notes("4 Passengers traveling")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.existsConflictingBooking(eq(100L), any(LocalDate.class), any(LocalDate.class))).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> {
            Booking b = i.getArgument(0);
            b.setId(700L);
            return b;
        });

        BookingResponse response = bookingService.createBooking(1L, request);

        assertNotNull(response);
        assertEquals(4, response.getPassengerCount());
        verify(bookingRepository).save(argThat(b -> Integer.valueOf(4).equals(b.getPassengerCount())));
    }

    @Test
    @DisplayName("Should throw BadRequestException when vehicle is not available")
    void testCreateBookingVehicleNotAvailable() {
        vehicle.setStatus(VehicleStatus.MAINTENANCE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(vehicle));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingService.createBooking(1L, bookingRequest));
        assertTrue(ex.getMessage().contains("not available for booking"));
    }

    @Test
    @DisplayName("Should throw BadRequestException when passenger count exceeds vehicle capacity")
    void testCreateBookingPassengerCountExceedsCapacity() {
        bookingRequest.setPassengerCount(7);
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(vehicle));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingService.createBooking(1L, bookingRequest));
        assertTrue(ex.getMessage().contains("exceeds vehicle seating capacity"));
    }

    @Test
    @DisplayName("Should throw BadRequestException when start date is in past")
    void testCreateBookingPastStartDate() {
        bookingRequest.setStartDate(LocalDate.now().minusDays(1));
        bookingRequest.setEndDate(LocalDate.now().plusDays(2));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(vehicle));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingService.createBooking(1L, bookingRequest));
        assertTrue(ex.getMessage().contains("cannot be in the past"));
    }

    @Test
    @DisplayName("Should throw BadRequestException when end date is before start date")
    void testCreateBookingEndDateBeforeStartDate() {
        bookingRequest.setStartDate(LocalDate.now().plusDays(5));
        bookingRequest.setEndDate(LocalDate.now().plusDays(2));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(vehicle));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingService.createBooking(1L, bookingRequest));
        assertTrue(ex.getMessage().contains("End date cannot be before start date"));
    }

    @Test
    @DisplayName("Should throw BadRequestException when conflicting booking exists")
    void testCreateBookingConflictingBooking() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.existsConflictingBooking(eq(100L), any(LocalDate.class), any(LocalDate.class))).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingService.createBooking(1L, bookingRequest));
        assertTrue(ex.getMessage().contains("already booked"));
    }

    @Test
    @DisplayName("Should retrieve customer's own bookings list")
    void testGetCustomerBookings() {
        when(bookingRepository.findByCustomerIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(sampleBooking));

        List<BookingResponse> list = bookingService.getCustomerBookings(1L);

        assertEquals(1, list.size());
        assertEquals("BK-TEST1234", list.get(0).getBookingReference());
        assertEquals("Alice Customer", list.get(0).getCustomerName());
    }

    @Test
    @DisplayName("Should allow customer to view their own booking details by ID")
    void testGetBookingByIdAuthorizedCustomer() {
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(sampleBooking));

        BookingResponse response = bookingService.getBookingById(customerUserDetails, 500L);

        assertNotNull(response);
        assertEquals("BK-TEST1234", response.getBookingReference());
    }

    @Test
    @DisplayName("Should deny another customer from viewing booking details by ID")
    void testGetBookingByIdUnauthorizedCustomerThrows() {
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(sampleBooking));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingService.getBookingById(otherCustomerUserDetails, 500L));
        assertTrue(ex.getMessage().contains("do not have permission"));
    }

    @Test
    @DisplayName("Should allow vehicle owner to view booking details by ID")
    void testGetBookingByIdAuthorizedOwner() {
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(sampleBooking));

        BookingResponse response = bookingService.getBookingById(ownerUserDetails, 500L);

        assertNotNull(response);
        assertEquals("BK-TEST1234", response.getBookingReference());
    }

    @Test
    @DisplayName("Should allow admin to view any booking details by ID")
    void testGetBookingByIdAuthorizedAdmin() {
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(sampleBooking));

        BookingResponse response = bookingService.getBookingById(adminUserDetails, 500L);

        assertNotNull(response);
        assertEquals("BK-TEST1234", response.getBookingReference());
    }

    @Test
    @DisplayName("Should allow customer to view their own booking details by reference")
    void testGetBookingByReferenceAuthorizedCustomer() {
        when(bookingRepository.findByBookingReference("BK-TEST1234")).thenReturn(Optional.of(sampleBooking));

        BookingResponse response = bookingService.getBookingByReference(customerUserDetails, "BK-TEST1234");

        assertNotNull(response);
        assertEquals("BK-TEST1234", response.getBookingReference());
    }

    @Test
    @DisplayName("Should deny another customer from viewing booking details by reference")
    void testGetBookingByReferenceUnauthorizedCustomerThrows() {
        when(bookingRepository.findByBookingReference("BK-TEST1234")).thenReturn(Optional.of(sampleBooking));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingService.getBookingByReference(otherCustomerUserDetails, "BK-TEST1234"));
        assertTrue(ex.getMessage().contains("do not have permission"));
    }

    @Test
    @DisplayName("Should allow customer to cancel their own pending booking")
    void testCancelBookingSuccess() {
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(sampleBooking));

        bookingService.cancelBooking(1L, 500L);

        assertEquals(BookingStatus.CANCELLED, sampleBooking.getBookingStatus());
        verify(bookingRepository).save(sampleBooking);
    }

    @Test
    @DisplayName("Should reject cancellation by unauthorized customer")
    void testCancelBookingUnauthorizedCustomerThrows() {
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(sampleBooking));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingService.cancelBooking(2L, 500L));
        assertTrue(ex.getMessage().contains("do not have permission"));
    }

    @Test
    @DisplayName("Should reject cancellation of already cancelled booking")
    void testCancelBookingAlreadyCancelledThrows() {
        sampleBooking.setBookingStatus(BookingStatus.CANCELLED);
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(sampleBooking));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingService.cancelBooking(1L, 500L));
        assertTrue(ex.getMessage().contains("already cancelled"));
    }

    @Test
    @DisplayName("Should reject cancellation of completed booking")
    void testCancelBookingCompletedThrows() {
        sampleBooking.setBookingStatus(BookingStatus.COMPLETED);
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(sampleBooking));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingService.cancelBooking(1L, 500L));
        assertTrue(ex.getMessage().contains("Cannot cancel"));
    }

    @Test
    @DisplayName("Should return null driverPhoneNumber when driver is null")
    void testDriverPhoneNumberNullWhenNoDriver() {
        sampleBooking.setDriver(null);
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(sampleBooking));

        BookingResponse response = bookingService.getBookingById(customerUserDetails, 500L);

        assertNotNull(response);
        assertNull(response.getDriverId());
        assertNull(response.getDriverPhoneNumber());
    }

    @Test
    @DisplayName("Should expose driverPhoneNumber when driver is assigned")
    void testDriverPhoneNumberPopulatedWhenDriverAssigned() {
        sampleBooking.setDriver(driver);
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(sampleBooking));

        BookingResponse response = bookingService.getBookingById(customerUserDetails, 500L);

        assertNotNull(response);
        assertEquals(4L, response.getDriverId());
        assertEquals("Dan Driver", response.getDriverName());
        assertEquals("+4444444444", response.getDriverPhoneNumber());
    }
}
