package com.carrental.customer.controller;

import com.carrental.common.dto.ApiResponse;
import com.carrental.customer.dto.request.CustomerUpdateRequest;
import com.carrental.customer.dto.response.CustomerResponse;
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

@Tag(name = "Customer Profile", description = "Endpoints for managing customer profile")
@RestController
@RequestMapping("/api/customers/profile")
@RequiredArgsConstructor
public class CustomerProfileController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        CustomerResponse response = customerService.getCustomerProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", response));
    }

    @PutMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                        @Valid @RequestBody CustomerUpdateRequest request) {
        CustomerResponse response = customerService.updateCustomerProfile(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PatchMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> patchProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                       @Valid @RequestBody CustomerUpdateRequest request) {
        CustomerResponse response = customerService.updateCustomerProfile(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        customerService.deleteCustomerAccount(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Customer account deleted successfully"));
    }
}
