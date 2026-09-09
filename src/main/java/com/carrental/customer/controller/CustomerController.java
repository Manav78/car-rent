package com.carrental.customer.controller;

import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.service.BookingService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.customer.dto.response.CustomerResponse;
import com.carrental.customer.dto.request.CustomerUpdateRequest;
import com.carrental.customer.service.CustomerService;
import com.carrental.security.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(name = "Customer", description = "Endpoints for customer profile, dashboard, and booking history")
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final BookingService bookingService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> getCustomerDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Customer dashboard accessed successfully",
                Map.of("message", "Welcome Customer! You can browse cars and manage bookings.")));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        CustomerResponse response = customerService.getCustomerProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", response));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                        @Valid @RequestBody CustomerUpdateRequest request) {
        CustomerResponse response = customerService.updateCustomerProfile(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PatchMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> patchProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                       @Valid @RequestBody CustomerUpdateRequest request) {
        CustomerResponse response = customerService.updateCustomerProfile(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @DeleteMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        customerService.deleteCustomerAccount(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Customer account deleted successfully"));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getCustomerHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BookingResponse> history = bookingService.getCustomerHistory(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking history retrieved", history));
    }
}

