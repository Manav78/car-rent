package com.carrental.driver.controller;

import com.carrental.booking.dto.request.BookingStatusUpdateRequest;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Driver Trips", description = "Endpoints for driver trips and assignment lifecycle")
@RestController
@RequestMapping({"/api/drivers/trips", "/api/v1/drivers/trips"})
@RequiredArgsConstructor
public class DriverTripController {

    private final BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAssignedTrips(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BookingResponse> list = bookingService.getDriverBookings(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Assigned trips retrieved", list));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<BookingResponse>> updateTripStatus(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                         @PathVariable("id") Long id,
                                                                         @RequestBody BookingStatusUpdateRequest request) {
        BookingResponse response = bookingService.updateDriverTripStatus(userDetails, id, request);
        return ResponseEntity.ok(ApiResponse.success("Trip status updated", response));
    }
}
