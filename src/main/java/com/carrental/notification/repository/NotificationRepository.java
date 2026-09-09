package com.carrental.notification.repository;

import com.carrental.notification.entity.Notification;
import com.carrental.notification.enums.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient.id = :recipientId " +
           "AND ((:status = com.carrental.notification.enums.NotificationStatus.READ AND n.isRead = true) " +
           "  OR (:status <> com.carrental.notification.enums.NotificationStatus.READ AND (n.isRead = false OR n.isRead IS NULL)))")
    long countByRecipientIdAndStatus(@Param("recipientId") Long recipientId, @Param("status") NotificationStatus status);

    long countByRecipientIdAndIsRead(Long recipientId, Boolean isRead);

    @Query(value = "SELECT n FROM Notification n WHERE n.recipient.id = :recipientId " +
                   "AND ((:status = com.carrental.notification.enums.NotificationStatus.READ AND n.isRead = true) " +
                   "  OR (:status <> com.carrental.notification.enums.NotificationStatus.READ AND (n.isRead = false OR n.isRead IS NULL))) " +
                   "ORDER BY n.createdAt DESC",
           countQuery = "SELECT COUNT(n) FROM Notification n WHERE n.recipient.id = :recipientId " +
                        "AND ((:status = com.carrental.notification.enums.NotificationStatus.READ AND n.isRead = true) " +
                        "  OR (:status <> com.carrental.notification.enums.NotificationStatus.READ AND (n.isRead = false OR n.isRead IS NULL)))")
    Page<Notification> findByRecipientIdAndStatusOrderByCreatedAtDesc(@Param("recipientId") Long recipientId, @Param("status") NotificationStatus status, Pageable pageable);

    Page<Notification> findByRecipientIdAndIsReadOrderByCreatedAtDesc(Long recipientId, Boolean isRead, Pageable pageable);

    Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.recipient.id = :recipientId AND (n.isRead IS NULL OR n.isRead = false)")
    void markAllAsRead(@Param("recipientId") Long recipientId, @Param("status") NotificationStatus status, @Param("readAt") LocalDateTime readAt);
}

