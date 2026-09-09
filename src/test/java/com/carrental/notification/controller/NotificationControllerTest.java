package com.carrental.notification.controller;

import com.carrental.common.dto.ApiResponse;
import com.carrental.notification.dto.response.NotificationResponse;
import com.carrental.notification.enums.NotificationStatus;
import com.carrental.notification.enums.NotificationType;
import com.carrental.notification.service.NotificationService;
import com.carrental.security.service.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController notificationController;

    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .email("user@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .build();
    }

    @Test
    @DisplayName("getMyNotifications - returns user's notifications")
    void testGetMyNotifications() {
        NotificationResponse response = NotificationResponse.builder()
                .id(10L)
                .userId(1L)
                .title("Welcome")
                .message("Welcome to Car Rental")
                .type(NotificationType.SYSTEM)
                .status(NotificationStatus.UNREAD)
                .createdAt(LocalDateTime.now())
                .build();

        when(notificationService.getUserNotifications(1L)).thenReturn(List.of(response));

        ResponseEntity<ApiResponse<List<NotificationResponse>>> result = notificationController.getMyNotifications(userDetails);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getData()).hasSize(1);
        assertThat(result.getBody().getData().get(0).getTitle()).isEqualTo("Welcome");
    }
}

