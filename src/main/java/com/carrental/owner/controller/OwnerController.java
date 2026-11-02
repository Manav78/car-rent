package com.carrental.owner.controller;

import com.carrental.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Owner", description = "Endpoints for owner dashboard")
@RestController
@RequestMapping({"/api/owners", "/api/v1/owners"})
@RequiredArgsConstructor
public class OwnerController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> getOwnerDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Owner dashboard accessed successfully",
                Map.of("message", "Welcome Car Owner! You can manage your vehicles and monitor earnings.")));
    }
}
