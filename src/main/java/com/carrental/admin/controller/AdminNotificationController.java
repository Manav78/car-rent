package com.carrental.admin.controller;

import com.carrental.admin.dto.response.AdminNotificationResponse;
import com.carrental.admin.dto.response.PageResponse;
import com.carrental.admin.dto.response.UnreadCountResponse;
import com.carrental.admin.service.AdminNotificationService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.security.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Admin Notifications", description = "Admin platform notifications and alerts")
@RestController
@RequestMapping({"/api/v1/admin/notifications", "/api/admin/notifications"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    private final AdminNotificationService adminNotificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminNotificationResponse>>> getNotifications(
            @RequestParam(required = false) Boolean isRead,
            @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetailsImpl principal
    ) {
        Page<AdminNotificationResponse> page = adminNotificationService.getNotifications(principal, isRead, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount(
            @AuthenticationPrincipal UserDetailsImpl principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminNotificationService.getUnreadCount(principal)));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal UserDetailsImpl principal
    ) {
        adminNotificationService.markAsRead(notificationId, principal);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetailsImpl principal
    ) {
        adminNotificationService.markAllAsRead(principal);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }
}

