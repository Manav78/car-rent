package com.carrental.owner.controller;

import com.carrental.common.dto.ApiResponse;
import com.carrental.owner.dto.response.OwnerResponse;
import com.carrental.owner.dto.request.OwnerUpdateRequest;
import com.carrental.owner.service.OwnerService;
import com.carrental.security.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Owner", description = "Endpoints for owner profile and fleet management")
@RestController
@RequestMapping("/api/owners")
@RequiredArgsConstructor
public class OwnerController {

    private final OwnerService ownerService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> getOwnerDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Owner dashboard accessed successfully",
                Map.of("message", "Welcome Car Owner! You can manage your vehicles and monitor earnings.")));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<OwnerResponse>> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        OwnerResponse response = ownerService.getOwnerProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Owner profile retrieved", response));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<OwnerResponse>> updateProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                    @Valid @RequestBody OwnerUpdateRequest request) {
        OwnerResponse response = ownerService.updateOwnerProfile(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Owner profile updated successfully", response));
    }
}

