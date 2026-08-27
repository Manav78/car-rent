package com.carrental.booking.controller;

import com.carrental.booking.dto.BookingRequest;
import com.carrental.booking.dto.BookingResponse;
import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.enums.PaymentStatus;
import com.carrental.booking.enums.TripType;
import com.carrental.booking.service.BookingService;
import com.carrental.security.service.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerCustomerTest {

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    private UserDetailsImpl userDetails;
    private BookingRequest bookingRequest;
    private BookingResponse bookingResponse;

    @BeforeEach
    void setUp() {
        userDetails = UserDetailsImpl.builder()
                .id(10L)
                .email("customer@example.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .build();

        bookingRequest = BookingRequest.builder()
                .vehicleId(1L)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(3))
                .pickupLocation("City Center")
                .dropoffLocation("Airport")
                .customerPhoneNumber("+1234567890")
                .tripType(TripType.LOCAL)
                .passengerCount(2)
                .build();

        bookingResponse = BookingResponse.builder()
                .id(100L)
                .bookingReference("BK-ABC12345")
                .customerId(10L)
                .customerName("Alice Customer")
                .vehicleId(1L)
                .vehicleName("Toyota Corolla")
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(3))
                .pickupLocation("City Center")
                .dropoffLocation("Airport")
                .tripType(TripType.LOCAL)
                .passengerCount(2)
                .bookingStatus(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("POST /api/bookings creates booking and returns 201 with exact message")
    void testCreateBookingEndpoint() {
        when(bookingService.createBooking(eq(10L), any(BookingRequest.class))).thenReturn(bookingResponse);

        var response = bookingController.createBooking(userDetails, bookingRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Booking request submitted successfully", response.getBody().getMessage());
        assertEquals("BK-ABC12345", response.getBody().getData().getBookingReference());
    }

    @Test
    @DisplayName("GET /api/bookings/my-bookings returns customer bookings")
    void testGetMyBookingsEndpoint() {
        when(bookingService.getCustomerBookings(10L)).thenReturn(List.of(bookingResponse));

        var response = bookingController.getMyBookings(userDetails);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
        assertEquals("BK-ABC12345", response.getBody().getData().get(0).getBookingReference());
    }

    @Test
    @DisplayName("GET /api/bookings/{id} passes authenticated user to service")
    void testGetBookingByIdEndpoint() {
        when(bookingService.getBookingById(eq(userDetails), eq(100L))).thenReturn(bookingResponse);

        var response = bookingController.getBookingById(userDetails, 100L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("BK-ABC12345", response.getBody().getData().getBookingReference());
    }

    @Test
    @DisplayName("GET /api/bookings/reference/{reference} passes authenticated user to service")
    void testGetBookingByReferenceEndpoint() {
        when(bookingService.getBookingByReference(eq(userDetails), eq("BK-ABC12345"))).thenReturn(bookingResponse);

        var response = bookingController.getBookingByReference(userDetails, "BK-ABC12345");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("BK-ABC12345", response.getBody().getData().getBookingReference());
    }

    @Test
    @DisplayName("PATCH /api/bookings/{id}/cancel cancels booking")
    void testCancelBookingEndpoint() {
        doNothing().when(bookingService).cancelBooking(10L, 100L);

        var response = bookingController.cancelBooking(userDetails, 100L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Booking cancelled successfully", response.getBody().getMessage());
        verify(bookingService).cancelBooking(10L, 100L);
    }
}
