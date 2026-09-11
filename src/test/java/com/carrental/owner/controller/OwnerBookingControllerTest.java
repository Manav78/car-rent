package com.carrental.owner.controller;

import com.carrental.booking.dto.request.BookingStatusUpdateRequest;
import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.service.BookingService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.owner.dto.request.DriverAssignmentRequest;
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

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OwnerBookingControllerTest {

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private OwnerBookingController ownerBookingController;

    private UserDetailsImpl ownerDetails;
    private BookingResponse samplePendingResponse;
    private BookingResponse sampleConfirmedResponse;

    @BeforeEach
    void setUp() {
        ownerDetails = UserDetailsImpl.builder()
                .id(3L)
                .email("owner@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER")))
                .build();

        samplePendingResponse = BookingResponse.builder()
                .id(101L)
                .bookingReference("BK-TEST001")
                .status(BookingStatus.PENDING)
                .build();

        sampleConfirmedResponse = BookingResponse.builder()
                .id(101L)
                .bookingReference("BK-TEST001")
                .status(BookingStatus.CONFIRMED)
                .driverId(5L)
                .driverName("Michael Knight")
                .build();
    }

    @Test
    @DisplayName("getOwnerBookings - all bookings for owner")
    void testGetOwnerBookings_All() {
        when(bookingService.getOwnerBookings(3L)).thenReturn(List.of(samplePendingResponse));

        ResponseEntity<ApiResponse<List<BookingResponse>>> response =
                ownerBookingController.getOwnerBookings(ownerDetails, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).hasSize(1);
    }

    @Test
    @DisplayName("getOwnerBookings - filtered by status")
    void testGetOwnerBookings_FilteredByStatus() {
        when(bookingService.getOwnerBookingsByStatus(3L, BookingStatus.PENDING))
                .thenReturn(List.of(samplePendingResponse));

        ResponseEntity<ApiResponse<List<BookingResponse>>> response =
                ownerBookingController.getOwnerBookings(ownerDetails, BookingStatus.PENDING);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).hasSize(1);
    }

    @Test
    @DisplayName("getBookingById - single booking retrieval")
    void testGetBookingById() {
        when(bookingService.getBookingById(eq(ownerDetails), eq(101L))).thenReturn(samplePendingResponse);

        ResponseEntity<ApiResponse<BookingResponse>> response =
                ownerBookingController.getBookingById(ownerDetails, 101L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().getBookingReference()).isEqualTo("BK-TEST001");
    }

    @Test
    @DisplayName("assignDriver - owner assigns driver to pending booking and confirms it")
    void testAssignDriver() {
        DriverAssignmentRequest request = new DriverAssignmentRequest(5L);
        when(bookingService.assignDriver(eq(ownerDetails), eq(101L), eq(5L))).thenReturn(sampleConfirmedResponse);

        ResponseEntity<ApiResponse<BookingResponse>> response =
                ownerBookingController.assignDriver(ownerDetails, 101L, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        verify(bookingService).assignDriver(ownerDetails, 101L, 5L);
    }

    @Test
    @DisplayName("updateBookingStatusPatch - owner rejects booking")
    void testUpdateBookingStatusPatch() {
        BookingStatusUpdateRequest request = BookingStatusUpdateRequest.builder()
                .status(BookingStatus.REJECTED)
                .reason("Vehicle unavailable")
                .build();
        BookingResponse sampleRejectedResponse = BookingResponse.builder()
                .id(101L)
                .bookingReference("BK-TEST001")
                .status(BookingStatus.REJECTED)
                .build();
        when(bookingService.updateBookingStatus(eq(ownerDetails), eq(101L), any(BookingStatusUpdateRequest.class)))
                .thenReturn(sampleRejectedResponse);

        ResponseEntity<ApiResponse<BookingResponse>> response =
                ownerBookingController.updateBookingStatusPatch(ownerDetails, 101L, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().getStatus()).isEqualTo(BookingStatus.REJECTED);
    }

    @Test
    @DisplayName("updateBookingStatusPut - owner updates status via PUT")
    void testUpdateBookingStatusPut() {
        BookingStatusUpdateRequest request = new BookingStatusUpdateRequest(BookingStatus.CANCELLED);
        BookingResponse cancelledResponse = BookingResponse.builder()
                .id(101L)
                .bookingReference("BK-TEST001")
                .status(BookingStatus.CANCELLED)
                .build();
        when(bookingService.updateBookingStatus(eq(ownerDetails), eq(101L), any(BookingStatusUpdateRequest.class)))
                .thenReturn(cancelledResponse);

        ResponseEntity<ApiResponse<BookingResponse>> response =
                ownerBookingController.updateBookingStatusPut(ownerDetails, 101L, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData().getStatus()).isEqualTo(BookingStatus.CANCELLED);
    }
}
