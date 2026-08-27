package com.carrental.customer.controller;

import com.carrental.common.dto.ApiResponse;
import com.carrental.customer.dto.CustomerResponse;
import com.carrental.customer.dto.CustomerUpdateRequest;
import com.carrental.customer.service.CustomerService;
import com.carrental.security.service.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

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
        return ResponseEntity.ok(ApiResponse.success("Customer profile retrieved", response));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                        @Valid @RequestBody CustomerUpdateRequest request) {
        CustomerResponse response = customerService.updateCustomerProfile(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Customer profile updated successfully", response));
    }

    @PatchMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> patchProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                       @Valid @RequestBody CustomerUpdateRequest request) {
        CustomerResponse response = customerService.updateCustomerProfile(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Customer profile updated successfully", response));
    }
}
