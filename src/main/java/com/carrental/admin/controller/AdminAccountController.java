package com.carrental.admin.controller;

import com.carrental.admin.dto.response.DeletedAccountResponse;
import com.carrental.admin.dto.response.PageResponse;
import com.carrental.admin.dto.request.SoftDeleteRequest;
import com.carrental.admin.service.AdminAccountService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.security.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Admin Accounts", description = "Admin soft-delete, restore, permanent delete, and deleted accounts listing")
@RestController
@RequestMapping("/api/admin/accounts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAccountController {

    private final AdminAccountService adminAccountService;

    @GetMapping("/deleted")
    public ResponseEntity<ApiResponse<PageResponse<DeletedAccountResponse>>> getDeletedAccounts(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<DeletedAccountResponse> page = adminAccountService.getDeletedAccounts(search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> softDeleteAccount(
            @PathVariable Long userId,
            @Valid @RequestBody(required = false) SoftDeleteRequest request,
            @AuthenticationPrincipal UserDetailsImpl principal
    ) {
        adminAccountService.softDeleteAccount(userId, request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Account soft-deleted successfully", null));
    }

    @PatchMapping("/{userId}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreAccount(@PathVariable Long userId) {
        adminAccountService.restoreAccount(userId);
        return ResponseEntity.ok(ApiResponse.ok("Account restored successfully", null));
    }

    @DeleteMapping("/{userId}/permanent")
    public ResponseEntity<ApiResponse<Void>> permanentlyDeleteAccount(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetailsImpl principal
    ) {
        adminAccountService.permanentlyDeleteAccount(userId, principal);
        return ResponseEntity.ok(ApiResponse.ok("Account permanently deleted successfully", null));
    }
}

