package com.carrental.admin.service;

import com.carrental.admin.dto.response.AdminNotificationResponse;
import com.carrental.admin.dto.response.UnreadCountResponse;
import com.carrental.notification.entity.Notification;
import com.carrental.notification.enums.NotificationStatus;
import com.carrental.notification.enums.NotificationType;
import com.carrental.notification.repository.NotificationRepository;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminNotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private com.carrental.admin.service.impl.AdminNotificationServiceImpl adminNotificationService;

    private UserDetailsImpl principal;
    private Notification notification;

    @BeforeEach
    void setUp() {
        principal = UserDetailsImpl.builder()
                .id(1L)
                .email("admin@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();

        notification = Notification.builder()
                .id(10L)
                .title("New Vehicle")
                .message("Vehicle pending approval")
                .type(NotificationType.SYSTEM)
                .status(NotificationStatus.UNREAD)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("getNotifications - all notifications (isRead == null)")
    void testGetNotifications_All() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> page = new PageImpl<>(List.of(notification), pageable, 1);
        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(1L, pageable)).thenReturn(page);

        Page<AdminNotificationResponse> result = adminNotificationService.getNotifications(principal, null, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).title()).isEqualTo("New Vehicle");
    }

    @Test
    @DisplayName("getNotifications - filtered by isRead = true")
    void testGetNotifications_Read() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> page = new PageImpl<>(List.of(notification), pageable, 1);
        when(notificationRepository.findByRecipientIdAndStatusOrderByCreatedAtDesc(1L, NotificationStatus.READ, pageable)).thenReturn(page);

        Page<AdminNotificationResponse> result = adminNotificationService.getNotifications(principal, true, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("getNotifications - filtered by isRead = false")
    void testGetNotifications_Unread() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> page = new PageImpl<>(List.of(notification), pageable, 1);
        when(notificationRepository.findByRecipientIdAndStatusOrderByCreatedAtDesc(1L, NotificationStatus.UNREAD, pageable)).thenReturn(page);

        Page<AdminNotificationResponse> result = adminNotificationService.getNotifications(principal, false, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("getNotifications - sanitizes Swagger dummy sort 'string' to createdAt DESC")
    void testGetNotifications_SwaggerDummySort() {
        Pageable pageableWithDummySort = PageRequest.of(0, 10, org.springframework.data.domain.Sort.by("string"));
        Pageable expectedPageable = PageRequest.of(0, 10, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        Page<Notification> page = new PageImpl<>(List.of(notification), expectedPageable, 1);
        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(1L, expectedPageable)).thenReturn(page);

        Page<AdminNotificationResponse> result = adminNotificationService.getNotifications(principal, null, pageableWithDummySort);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("getUnreadCount - returns count")
    void testGetUnreadCount() {
        when(notificationRepository.countByRecipientIdAndStatus(1L, NotificationStatus.UNREAD)).thenReturn(5L);

        UnreadCountResponse response = adminNotificationService.getUnreadCount(principal);

        assertThat(response).isNotNull();
        assertThat(response.unreadCount()).isEqualTo(5L);
    }

    @Test
    @DisplayName("markAsRead - marks unread notification as read")
    void testMarkAsRead_Success() {
        when(notificationRepository.findByIdAndRecipientId(10L, 1L)).thenReturn(Optional.of(notification));

        adminNotificationService.markAsRead(10L, principal);

        assertThat(notification.getStatus()).isEqualTo(NotificationStatus.READ);
        assertThat(notification.getReadAt()).isNotNull();
        verify(notificationRepository).save(notification);
    }

    @Test
    @DisplayName("markAsRead - already read skips save")
    void testMarkAsRead_AlreadyRead() {
        notification.setStatus(NotificationStatus.READ);
        when(notificationRepository.findByIdAndRecipientId(10L, 1L)).thenReturn(Optional.of(notification));

        adminNotificationService.markAsRead(10L, principal);

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("markAsRead - not found throws NOT_FOUND")
    void testMarkAsRead_NotFound() {
        when(notificationRepository.findByIdAndRecipientId(10L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminNotificationService.markAsRead(10L, principal))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    @DisplayName("markAllAsRead - calls repository markAllAsRead")
    void testMarkAllAsRead() {
        adminNotificationService.markAllAsRead(principal);

        verify(notificationRepository).markAllAsRead(eq(1L), eq(NotificationStatus.READ), any(LocalDateTime.class));
    }
}

