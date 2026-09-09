package com.carrental.owner.controller;

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

@Tag(name = "Owner Bookings", description = "Endpoints for viewing owner vehicle bookings")
@RestController
@RequestMapping({ "/api/v1/owners/bookings", "/api/owners/bookings" })
@RequiredArgsConstructor
public class OwnerBookingController {

    private final BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getOwnerBookings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BookingResponse> list = bookingService.getOwnerBookings(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Owner vehicle bookings retrieved", list));
    }
}
