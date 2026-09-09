package com.carrental.admin.service;

import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.notification.entity.Notification;
import com.carrental.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminNotificationPublisherTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminNotificationPublisher publisher;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = User.builder().id(1L).email("admin@test.com").role(Role.ADMIN).build();
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(List.of(adminUser));
    }

    @Test
    @DisplayName("notifyOwnerRegistered publishes notification to all admins")
    void testNotifyOwnerRegistered() {
        publisher.notifyOwnerRegistered(2L, "Alice");
        verify(notificationRepository).saveAll(any());
    }

    @Test
    @DisplayName("notifyCustomerRegistered publishes notification to all admins")
    void testNotifyCustomerRegistered() {
        publisher.notifyCustomerRegistered(3L, "Bob");
        verify(notificationRepository).saveAll(any());
    }

    @Test
    @DisplayName("notifyVehicleSubmitted publishes notification to all admins")
    void testNotifyVehicleSubmitted() {
        publisher.notifyVehicleSubmitted(10L, "KA01AB1234", "Alice");
        verify(notificationRepository).saveAll(any());
    }

    @Test
    @DisplayName("notifyDriverAdded publishes notification to all admins")
    void testNotifyDriverAdded() {
        publisher.notifyDriverAdded(20L, "Charlie", "Alice");
        verify(notificationRepository).saveAll(any());
    }

    @Test
    @DisplayName("notifyOwnerDriverApplication publishes notification to all admins")
    void testNotifyOwnerDriverApplication() {
        publisher.notifyOwnerDriverApplication(30L, "Alice");
        verify(notificationRepository).saveAll(any());
    }

    @Test
    @DisplayName("notifySubscriptionActivated publishes notification to all admins")
    void testNotifySubscriptionActivated() {
        publisher.notifySubscriptionActivated(40L, "Alice", "Premium");
        verify(notificationRepository).saveAll(any());
    }

    @Test
    @DisplayName("notifySubscriptionExpiring publishes notification to all admins")
    void testNotifySubscriptionExpiring() {
        publisher.notifySubscriptionExpiring(40L, "Alice", "Premium", 3);
        verify(notificationRepository).saveAll(any());
    }
}

