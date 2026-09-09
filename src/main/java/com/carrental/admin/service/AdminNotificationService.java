package com.carrental.admin.service;

import com.carrental.admin.dto.response.AdminNotificationResponse;
import com.carrental.admin.dto.response.UnreadCountResponse;
import com.carrental.security.service.UserDetailsImpl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminNotificationService {
    Page<AdminNotificationResponse> getNotifications(UserDetailsImpl principal, Boolean isRead, Pageable pageable);
    UnreadCountResponse getUnreadCount(UserDetailsImpl principal);
    void markAsRead(Long notificationId, UserDetailsImpl principal);
    void markAllAsRead(UserDetailsImpl principal);
}

