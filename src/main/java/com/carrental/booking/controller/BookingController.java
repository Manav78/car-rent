package com.carrental.booking.controller;

import com.carrental.booking.dto.request.BookingRequest;
import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.dto.request.BookingStatusUpdateRequest;
import com.carrental.booking.service.BookingService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.security.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Bookings", description = "Endpoints for vehicle booking lifecycle and management")
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                      @Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Booking request submitted successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                       @PathVariable("id") Long id) {
        BookingResponse response = bookingService.getBookingById(userDetails, id);
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved successfully", response));
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BookingResponse> list = bookingService.getCustomerBookings(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Customer bookings retrieved", list));
    }

    @GetMapping("/owner-bookings")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getOwnerBookings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BookingResponse> list = bookingService.getOwnerBookings(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Owner vehicle bookings retrieved", list));
    }

    @GetMapping("/driver-trips")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getDriverTrips(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BookingResponse> list = bookingService.getDriverBookings(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Driver assigned trips retrieved", list));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('OWNER') or hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id,
            @Valid @RequestBody BookingStatusUpdateRequest request) {
        BookingResponse response = bookingService.updateBookingStatus(userDetails, id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated", response));
    }
}

