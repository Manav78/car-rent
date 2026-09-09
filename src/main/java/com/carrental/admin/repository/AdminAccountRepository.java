package com.carrental.admin.repository;

import com.carrental.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminAccountRepository extends JpaRepository<User, Long> {

    @Query(value = """
            SELECT u FROM User u
            LEFT JOIN FETCH u.deletedByUser
            WHERE u.deletedAt IS NOT NULL
              AND (:search IS NULL OR :search = ''
                   OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR u.mobile LIKE CONCAT('%', :search, '%'))
            ORDER BY u.deletedAt DESC
            """,
            countQuery = """
            SELECT count(u) FROM User u
            WHERE u.deletedAt IS NOT NULL
              AND (:search IS NULL OR :search = ''
                   OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR u.mobile LIKE CONCAT('%', :search, '%'))
            """)
    Page<User> findDeletedAccounts(@Param("search") String search, Pageable pageable);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.deletedByUser WHERE u.id = :id")
    Optional<User> findUserByIdWithRoles(@Param("id") Long id);
}

