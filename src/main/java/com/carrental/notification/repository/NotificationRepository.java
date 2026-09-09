package com.carrental.notification.repository;

import com.carrental.notification.entity.Notification;
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

    // Direct, fast queries against the actual persistent `isRead` column
    long countByRecipientIdAndIsReadFalse(Long recipientId);

    long countByRecipientIdAndIsRead(Long recipientId, Boolean isRead);

    // Filter by read / unread (or all if isRead is null)
    @Query(
            value = """
            SELECT n FROM Notification n 
            WHERE n.recipient.id = :recipientId 
              AND (:isRead IS NULL OR n.isRead = :isRead) 
            ORDER BY n.createdAt DESC
            """,
            countQuery = """
            SELECT COUNT(n) FROM Notification n 
            WHERE n.recipient.id = :recipientId 
              AND (:isRead IS NULL OR n.isRead = :isRead)
            """
    )
    Page<Notification> findByRecipientIdAndIsReadFilter(
            @Param("recipientId") Long recipientId,
            @Param("isRead") Boolean isRead,
            Pageable pageable
    );

    Page<Notification> findByRecipientIdAndIsReadOrderByCreatedAtDesc(Long recipientId, Boolean isRead, Pageable pageable);

    Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);

    @Modifying
    @Query("""
        UPDATE Notification n 
        SET n.isRead = true, 
            n.readAt = :readAt 
        WHERE n.recipient.id = :recipientId 
          AND (n.isRead = false OR n.isRead IS NULL)
    """)
    int markAllAsRead(
            @Param("recipientId") Long recipientId,
            @Param("readAt") LocalDateTime readAt
    );
}