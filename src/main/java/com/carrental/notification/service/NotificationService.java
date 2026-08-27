package com.carrental.notification.service;

import com.carrental.auth.entity.User;
import com.carrental.notification.dto.NotificationResponse;
import com.carrental.notification.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    NotificationResponse createNotification(User recipient, String title, String message, NotificationType type);

    List<NotificationResponse> getUserNotifications(Long userId);

    void markAsRead(Long notificationId);

    long getUnreadCount(Long userId);
}
