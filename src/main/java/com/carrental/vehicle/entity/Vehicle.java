package com.carrental.vehicle.entity;

import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.owner.entity.OwnerProfile;
import com.carrental.vehicle.enums.FuelType;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.enums.VehicleType;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private OwnerProfile owner;

    @Column(name = "brand", nullable = false, length = 50)
    private String brand;

    @Column(name = "model", nullable = false, length = 50)
    private String model;

    @Column(name = "\"year\"", nullable = false)
    private Integer year;

    @Column(name = "vehicle_number", unique = true, nullable = false, length = 30)
    private String vehicleNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false, length = 30)
    private VehicleType vehicleType;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type", nullable = false, length = 30)
    private FuelType fuelType;

    @Column(name = "seating_capacity", nullable = false)
    private Integer seatingCapacity;

    @Column(name = "has_ac", nullable = false)
    private Boolean hasAc = false;

    @Column(name = "price_per_km", nullable = false)
    private Integer pricePerKm;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private VehicleStatus status = VehicleStatus.INACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 30)
    private ApprovalDecision approvalStatus = ApprovalDecision.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VehicleImage> images = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Vehicle(Long id, OwnerProfile owner, String brand, String model, Integer year,
                   String vehicleNumber, String licensePlate,
                   VehicleType vehicleType, FuelType fuelType, Integer seatingCapacity,
                   Boolean hasAc, Integer pricePerKm,
                   VehicleStatus status, ApprovalDecision approvalStatus, String rejectionReason,
                   String location, LocalDateTime approvedAt, String description,
                   List<VehicleImage> images, List<String> imageUrls,
                   LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.owner = owner;
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.vehicleNumber = vehicleNumber != null ? vehicleNumber : licensePlate;
        this.vehicleType = vehicleType;
        this.fuelType = fuelType;
        this.seatingCapacity = seatingCapacity;
        this.hasAc = hasAc != null ? hasAc : false;
        this.pricePerKm = pricePerKm;
        this.status = status != null ? status : VehicleStatus.INACTIVE;
        this.approvalStatus = approvalStatus != null ? approvalStatus : ApprovalDecision.PENDING;
        this.rejectionReason = rejectionReason;
        this.location = location;
        this.approvedAt = approvedAt;
        this.description = description;
        if (images != null) {
            this.images = images;
        } else if (imageUrls != null) {
            this.images = new ArrayList<>();
            for (String url : imageUrls) {
                this.images.add(VehicleImage.builder().vehicle(this).imageUrl(url).imageType("GALLERY").build());
            }
        } else {
            this.images = new ArrayList<>();
        }
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = VehicleStatus.INACTIVE;
        }
        if (this.approvalStatus == null) {
            this.approvalStatus = ApprovalDecision.PENDING;
        }
        if (this.hasAc == null) {
            this.hasAc = false;
        }
        if (this.images == null) {
            this.images = new ArrayList<>();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper methods for images
    public void addImage(String imageUrl, String imageType) {
        if (this.images == null) {
            this.images = new ArrayList<>();
        }
        VehicleImage image = VehicleImage.builder()
                .vehicle(this)
                .imageUrl(imageUrl)
                .imageType(imageType)
                .build();
        this.images.add(image);
    }

    public List<String> getImageUrls() {
        if (images == null) return new ArrayList<>();
        return images.stream().map(VehicleImage::getImageUrl).toList();
    }

    public void setImageUrls(List<String> urls) {
        if (this.images == null) {
            this.images = new ArrayList<>();
        } else {
            this.images.clear();
        }
        if (urls != null) {
            for (String url : urls) {
                addImage(url, "GALLERY");
            }
        }
    }

    // Backward-compatibility helpers
    public String getLicensePlate() {
        return vehicleNumber;
    }

    public void setLicensePlate(String licensePlate) {
        this.vehicleNumber = licensePlate;
    }

    public void setApprovalStatus(ApprovalDecision approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        if (approvalStatus != null) {
            this.approvalStatus = ApprovalDecision.valueOf(approvalStatus.toUpperCase());
        }
    }
}

