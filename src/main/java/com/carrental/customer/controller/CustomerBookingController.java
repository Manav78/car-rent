package com.carrental.customer.controller;

import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.service.BookingService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.security.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Customer Bookings", description = "Endpoints for customer bookings and history")
@RestController
@RequestMapping({ "/api/v1/customers/bookings", "/api/customers/bookings" })
@RequiredArgsConstructor
public class CustomerBookingController {

    private final BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getCustomerBookings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BookingResponse> bookings = bookingService.getCustomerBookings(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Customer bookings retrieved", bookings));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getCustomerHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BookingResponse> history = bookingService.getCustomerHistory(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking history retrieved", history));
    }
}
