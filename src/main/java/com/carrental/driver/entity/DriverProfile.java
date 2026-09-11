package com.carrental.driver.entity;

import com.carrental.auth.entity.User;
import com.carrental.driver.enums.DriverStatus;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "driver_profiles")
@Getter
@Setter
@NoArgsConstructor
public class DriverProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by_owner_id")
    private User addedByOwner;

    @Column(name = "license_number", nullable = false, unique = true, length = 50)
    private String licenseNumber;

    @Column(name = "license_expiry_date", nullable = false)
    private LocalDate licenseExpiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private DriverStatus status = DriverStatus.PENDING;

    @Column(name = "inactive_reason", columnDefinition = "TEXT")
    private String inactiveReason;

    @Column(name = "approval_status", nullable = false, length = 30)
    private String approvalStatus = "PENDING";

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public DriverProfile(Long id, User user, User addedByOwner,
                         String licenseNumber, String drivingLicenseNumber,
                         LocalDate licenseExpiryDate, DriverStatus status,
                         String inactiveReason, String approvalStatus, String rejectionReason,
                         LocalDateTime approvedAt,
                         LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.addedByOwner = addedByOwner;
        this.licenseNumber = licenseNumber != null ? licenseNumber : drivingLicenseNumber;
        this.licenseExpiryDate = licenseExpiryDate;
        this.status = status != null ? status : DriverStatus.PENDING;
        this.inactiveReason = inactiveReason;
        this.approvalStatus = approvalStatus != null ? approvalStatus : "PENDING";
        this.rejectionReason = rejectionReason;
        this.approvedAt = approvedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = DriverStatus.PENDING;
        }
        if (this.approvalStatus == null) {
            this.approvalStatus = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Backward-compatibility helpers
    public String getDrivingLicenseNumber() {
        return licenseNumber;
    }

    public void setDrivingLicenseNumber(String drivingLicenseNumber) {
        this.licenseNumber = drivingLicenseNumber;
    }
}

