package com.carrental.notification.service;

import com.carrental.notification.service.impl.NotificationServiceImpl;

import com.carrental.auth.entity.User;
import com.carrental.notification.dto.response.NotificationResponse;
import com.carrental.notification.entity.Notification;
import com.carrental.notification.enums.NotificationStatus;
import com.carrental.notification.enums.NotificationType;
import com.carrental.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User user;
    private Notification notification;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("user@test.com")
                .build();

        notification = Notification.builder()
                .id(10L)
                .recipient(user)
                .title("Test Notification")
                .message("Test Message")
                .type(NotificationType.SYSTEM)
                .status(NotificationStatus.UNREAD)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("createNotification - saves and returns response")
    void testCreateNotification() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationResponse response = notificationService.createNotification(
                user, "Test Notification", "Test Message", NotificationType.SYSTEM
        );

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getTitle()).isEqualTo("Test Notification");
        assertThat(response.getUserId()).isEqualTo(1L);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("getUserNotifications - returns user's notifications")
    void testGetUserNotifications() {
        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(notification));

        List<NotificationResponse> list = notificationService.getUserNotifications(1L);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getId()).isEqualTo(10L);
        assertThat(list.get(0).getTitle()).isEqualTo("Test Notification");
    }
}

