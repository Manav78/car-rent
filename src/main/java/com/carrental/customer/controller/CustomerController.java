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
import java.util.Map;

@Tag(name = "Customer", description = "Endpoints for customer dashboard and booking history")
@RestController
@RequestMapping({"/api/customers", "/api/v1/customers"})
@RequiredArgsConstructor
public class CustomerController {

    private final BookingService bookingService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> getCustomerDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Customer dashboard accessed successfully",
                Map.of("message", "Welcome Customer! You can browse cars and manage bookings.")));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getCustomerHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BookingResponse> history = bookingService.getCustomerHistory(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking history retrieved", history));
    }
}
