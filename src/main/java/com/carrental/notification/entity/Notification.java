package com.carrental.notification.entity;

import com.carrental.auth.entity.User;
import com.carrental.notification.enums.NotificationStatus;
import com.carrental.notification.enums.NotificationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 30)
    private NotificationType notificationType;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Notification(Long id, User recipient, String title, String message,
                        NotificationType notificationType, NotificationType type,
                        String referenceType, Long referenceId,
                        Boolean isRead, NotificationStatus status,
                        LocalDateTime readAt, LocalDateTime createdAt) {
        this.id = id;
        this.recipient = recipient;
        this.title = title;
        this.message = message;
        this.notificationType = notificationType != null ? notificationType : type;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.isRead = isRead != null ? isRead : (status == NotificationStatus.READ);
        this.readAt = readAt;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isRead == null) {
            this.isRead = false;
        }
    }

    // Backward-compatibility helpers
    public NotificationType getType() {
        return notificationType;
    }

    public void setType(NotificationType type) {
        this.notificationType = type;
    }

    public NotificationStatus getStatus() {
        return Boolean.TRUE.equals(isRead) ? NotificationStatus.READ : NotificationStatus.UNREAD;
    }

    public void setStatus(NotificationStatus status) {
        this.isRead = (status == NotificationStatus.READ);
    }
}

