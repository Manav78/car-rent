package com.carrental.auth.repository;

import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByMobile(String mobile);

    boolean existsByMobile(String mobile);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.mobile = :phoneNumber")
    boolean existsByPhoneNumber(@Param("phoneNumber") String phoneNumber);

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r = :role")
    List<User> findByRole(@Param("role") Role role);

    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r = :role")
    long countByRole(@Param("role") Role role);

    long countByDeletedAtIsNotNull();

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.deletedByUser WHERE u.id = :id")
    Optional<User> findByIdWithDeletedBy(@Param("id") Long id);
}

