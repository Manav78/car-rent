package com.carrental.auth.repository;

import com.carrental.auth.entity.EmailVerificationToken;
import com.carrental.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByToken(String token);

    Optional<EmailVerificationToken> findByUser(User user);

    @Modifying
    void deleteByUser(User user);

    @Modifying
    void deleteByExpiryDateBefore(Instant now);
}

