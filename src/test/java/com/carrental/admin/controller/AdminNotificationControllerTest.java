package com.carrental.admin.controller;

import com.carrental.admin.dto.response.AdminNotificationResponse;
import com.carrental.admin.dto.response.PageResponse;
import com.carrental.admin.dto.response.UnreadCountResponse;
import com.carrental.admin.service.AdminNotificationService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.security.service.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminNotificationControllerTest {

    @Mock
    private AdminNotificationService adminNotificationService;

    @InjectMocks
    private AdminNotificationController adminNotificationController;

    private UserDetailsImpl principal;

    @BeforeEach
    void setUp() {
        principal = UserDetailsImpl.builder()
                .id(1L)
                .email("admin@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();
    }

    @Test
    @DisplayName("getNotifications - returns notifications page")
    void testGetNotifications() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<AdminNotificationResponse> page = new PageImpl<>(Collections.emptyList(), pageable, 0);
        when(adminNotificationService.getNotifications(eq(principal), eq(false), eq(pageable))).thenReturn(page);

        ResponseEntity<ApiResponse<PageResponse<AdminNotificationResponse>>> result =
                adminNotificationController.getNotifications(false, pageable, principal);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("getUnreadCount - returns unread count")
    void testGetUnreadCount() {
        when(adminNotificationService.getUnreadCount(principal)).thenReturn(new UnreadCountResponse(7L));

        ResponseEntity<ApiResponse<UnreadCountResponse>> result = adminNotificationController.getUnreadCount(principal);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().unreadCount()).isEqualTo(7L);
    }

    @Test
    @DisplayName("markAsRead - success")
    void testMarkAsRead() {
        ResponseEntity<ApiResponse<Void>> result = adminNotificationController.markAsRead(10L, principal);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(adminNotificationService).markAsRead(10L, principal);
    }

    @Test
    @DisplayName("markAllAsRead - success")
    void testMarkAllAsRead() {
        ResponseEntity<ApiResponse<Void>> result = adminNotificationController.markAllAsRead(principal);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(adminNotificationService).markAllAsRead(principal);
    }
}

