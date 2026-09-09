package com.carrental.notification.controller;

import com.carrental.common.dto.ApiResponse;
import com.carrental.notification.dto.response.NotificationResponse;
import com.carrental.notification.service.NotificationService;
import com.carrental.security.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Notifications", description = "Endpoints for user notifications")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<NotificationResponse> list = notificationService.getUserNotifications(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", list));
    }
}

