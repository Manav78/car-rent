package com.carrental.admin.repository;

import com.carrental.admin.entity.Approval;
import com.carrental.admin.enums.ApprovalEntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {

    @Query("""
            SELECT a
            FROM Approval a
            JOIN FETCH a.adminUser
            WHERE a.entityType = :entityType
              AND a.entityId = :entityId
            ORDER BY a.createdAt DESC
            """)
    List<Approval> findHistoryWithAdmin(
            @Param("entityType") ApprovalEntityType entityType,
            @Param("entityId") Long entityId
    );
}

