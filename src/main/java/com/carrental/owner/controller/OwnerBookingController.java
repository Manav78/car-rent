package com.carrental.owner.controller;

import com.carrental.booking.dto.request.BookingStatusUpdateRequest;
import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.service.BookingService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.owner.dto.request.DriverAssignmentRequest;
import com.carrental.owner.dto.request.DriverReplacementRequest;
import com.carrental.owner.dto.request.VehicleReplacementRequest;
import com.carrental.security.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Owner Bookings", description = "Endpoints for owner vehicle booking management")
@RestController
@RequestMapping({"/api/owners/bookings", "/api/v1/owners/bookings"})
@RequiredArgsConstructor
public class OwnerBookingController {

    private final BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getOwnerBookings(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(value = "status", required = false) BookingStatus status) {
        List<BookingResponse> list = (status != null)
                ? bookingService.getOwnerBookingsByStatus(userDetails.getId(), status)
                : bookingService.getOwnerBookings(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Owner vehicle bookings retrieved", list));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id) {
        BookingResponse response = bookingService.getBookingById(userDetails, id);
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved successfully", response));
    }

    @PostMapping("/{id}/assign-driver")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<BookingResponse>> assignDriver(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id,
            @Valid @RequestBody DriverAssignmentRequest request) {
        BookingResponse response = bookingService.assignDriver(userDetails, id, request.getDriverId());
        return ResponseEntity.ok(ApiResponse.success("Driver assigned and booking confirmed successfully", response));
    }

    @PostMapping("/{id}/replace-driver")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<BookingResponse>> replaceDriver(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id,
            @Valid @RequestBody DriverReplacementRequest request) {
        BookingResponse response = bookingService.replaceDriver(userDetails, id, request);
        return ResponseEntity.ok(ApiResponse.success("Driver replaced successfully", response));
    }

    @PostMapping("/{id}/replace-vehicle")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<BookingResponse>> replaceVehicle(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id,
            @Valid @RequestBody VehicleReplacementRequest request) {
        BookingResponse response = bookingService.replaceVehicle(userDetails, id, request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle replaced successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatusPatch(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id,
            @Valid @RequestBody BookingStatusUpdateRequest request) {
        BookingResponse response = bookingService.updateBookingStatus(userDetails, id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", response));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatusPut(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable("id") Long id,
            @Valid @RequestBody BookingStatusUpdateRequest request) {
        BookingResponse response = bookingService.updateBookingStatus(userDetails, id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", response));
    }
}
