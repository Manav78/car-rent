package com.carrental.notification.service.impl;

import com.carrental.notification.service.NotificationService;

import com.carrental.auth.entity.User;
import com.carrental.notification.dto.response.NotificationResponse;
import com.carrental.notification.entity.Notification;
import com.carrental.notification.enums.NotificationStatus;
import com.carrental.notification.enums.NotificationType;
import com.carrental.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public NotificationResponse createNotification(User recipient, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .type(type)
                .status(NotificationStatus.UNREAD)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Created notification ID: {} for user: {}", saved.getId(), recipient.getEmail());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getRecipient() != null ? notification.getRecipient().getId() : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .status(notification.getStatus())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}

