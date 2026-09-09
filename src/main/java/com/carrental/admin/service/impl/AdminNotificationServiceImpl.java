package com.carrental.admin.service.impl;

import com.carrental.admin.dto.response.AdminNotificationResponse;
import com.carrental.admin.dto.response.UnreadCountResponse;
import com.carrental.admin.service.AdminNotificationService;
import com.carrental.notification.entity.Notification;
import com.carrental.notification.enums.NotificationStatus;
import com.carrental.notification.repository.NotificationRepository;
import com.carrental.security.service.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminNotificationServiceImpl implements AdminNotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminNotificationResponse> getNotifications(
            UserDetailsImpl principal,
            Boolean isRead,
            Pageable pageable
    ) {
        Pageable effectivePageable = sanitizePageable(pageable);
        Page<Notification> page;

        if (isRead == null) {
            page = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(
                    principal.getId(), effectivePageable);
        } else {
            page = notificationRepository.findByRecipientIdAndIsReadOrderByCreatedAtDesc(
                    principal.getId(), isRead, effectivePageable);
        }

        return page.map(this::toResponse);
    }

    private Pageable sanitizePageable(Pageable pageable) {
        if (pageable == null) {
            return PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        if (pageable.getSort().isUnsorted()) {
            return pageable;
        }
        boolean hasSwaggerDummySort = pageable.getSort().stream()
                .anyMatch(order -> "string".equalsIgnoreCase(order.getProperty()));
        if (hasSwaggerDummySort) {
            return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        return pageable;
    }

    @Override
    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(UserDetailsImpl principal) {
        long count = notificationRepository.countByRecipientIdAndIsReadFalse(principal.getId());
        return new UnreadCountResponse(count);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, UserDetailsImpl principal) {
        Notification notification = notificationRepository
                .findByIdAndRecipientId(notificationId, principal.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification not found"
                ));

        if (Boolean.TRUE.equals(notification.getIsRead())) {
            return;
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(UserDetailsImpl principal) {
        notificationRepository.markAllAsRead(principal.getId(), LocalDateTime.now());
    }

    private AdminNotificationResponse toResponse(Notification n) {
        return new AdminNotificationResponse(
                n.getId(),
                n.getType() != null ? n.getType().name() : "SYSTEM",
                n.getTitle(),
                n.getMessage(),
                n.getReferenceType(),
                n.getReferenceId(),
                Boolean.TRUE.equals(n.getIsRead()),
                n.getReadAt(),
                n.getCreatedAt()
        );
    }
}