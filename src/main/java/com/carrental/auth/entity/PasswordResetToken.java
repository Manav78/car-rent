package com.carrental.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token", nullable = false, length = 255)
    private String token;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(this.expiresAt);
    }

    public boolean isUsed() {
        return usedAt != null;
    }

    // Backward-compatibility helpers
    public Instant getExpiryDate() {
        return expiresAt;
    }

    public void setExpiryDate(Instant expiryDate) {
        this.expiresAt = expiryDate;
    }

    public void setUsed(boolean used) {
        this.usedAt = used ? Instant.now() : null;
    }

    public static class PasswordResetTokenBuilder {
        public PasswordResetTokenBuilder expiryDate(Instant expiryDate) {
            this.expiresAt = expiryDate;
            return this;
        }

        public PasswordResetTokenBuilder used(boolean used) {
            this.usedAt = used ? Instant.now() : null;
            return this;
        }
    }
}

