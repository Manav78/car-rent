package com.carrental.booking.controller;

import com.carrental.booking.dto.request.BookingRequest;
import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.dto.request.BookingStatusUpdateRequest;
import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.enums.TripType;
import com.carrental.booking.service.BookingService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.security.service.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    private UserDetailsImpl userDetails;
    private BookingResponse sampleResponse;

    @BeforeEach
    void setUp() {
        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .email("customer@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .build();

        sampleResponse = BookingResponse.builder()
                .id(100L)
                .bookingReference("BK-TEST001")
                .bookingStatus(BookingStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("createBooking - returns CREATED and ApiResponse")
    void testCreateBooking() {
        BookingRequest request = BookingRequest.builder()
                .vehicleId(10L)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(3))
                .pickupLocation("A")
                .dropoffLocation("B")
                .customerPhoneNumber("1234567890")
                .tripType(TripType.LOCAL)
                .passengerCount(2)
                .build();

        when(bookingService.createBooking(eq(1L), any(BookingRequest.class))).thenReturn(sampleResponse);

        ResponseEntity<ApiResponse<BookingResponse>> result = bookingController.createBooking(userDetails, request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().isSuccess()).isTrue();
        assertThat(result.getBody().getData().getBookingReference()).isEqualTo("BK-TEST001");
    }

    @Test
    @DisplayName("getBookingById - returns OK and ApiResponse")
    void testGetBookingById() {
        when(bookingService.getBookingById(eq(userDetails), eq(100L))).thenReturn(sampleResponse);

        ResponseEntity<ApiResponse<BookingResponse>> result = bookingController.getBookingById(userDetails, 100L);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().isSuccess()).isTrue();
        assertThat(result.getBody().getData().getId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("getMyBookings - returns customer bookings")
    void testGetMyBookings() {
        when(bookingService.getCustomerBookings(1L)).thenReturn(List.of(sampleResponse));

        ResponseEntity<ApiResponse<List<BookingResponse>>> result = bookingController.getMyBookings(userDetails);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getData()).hasSize(1);
    }

    @Test
    @DisplayName("getOwnerBookings - returns owner vehicle bookings")
    void testGetOwnerBookings() {
        when(bookingService.getOwnerBookings(1L)).thenReturn(List.of(sampleResponse));

        ResponseEntity<ApiResponse<List<BookingResponse>>> result = bookingController.getOwnerBookings(userDetails);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getData()).hasSize(1);
    }

    @Test
    @DisplayName("getDriverTrips - returns driver trips")
    void testGetDriverTrips() {
        when(bookingService.getDriverBookings(1L)).thenReturn(List.of(sampleResponse));

        ResponseEntity<ApiResponse<List<BookingResponse>>> result = bookingController.getDriverTrips(userDetails);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getData()).hasSize(1);
    }

    @Test
    @DisplayName("updateBookingStatus - returns updated booking response")
    void testUpdateBookingStatus() {
        BookingStatusUpdateRequest request = new BookingStatusUpdateRequest(BookingStatus.CONFIRMED);
        BookingResponse confirmedResponse = BookingResponse.builder()
                .id(100L)
                .bookingReference("BK-TEST001")
                .bookingStatus(BookingStatus.CONFIRMED)
                .build();

        when(bookingService.updateBookingStatus(eq(100L), any(BookingStatusUpdateRequest.class)))
                .thenReturn(confirmedResponse);

        ResponseEntity<ApiResponse<BookingResponse>> result = bookingController.updateBookingStatus(100L, request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getData().getBookingStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }
}

