package com.carrental.booking.entity;

import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.enums.TripType;
import com.carrental.customer.entity.CustomerProfile;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.vehicle.entity.Vehicle;
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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_reference", length = 50)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private CustomerProfile customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private DriverProfile driver;

    @Column(name = "customer_phone_number", nullable = false, length = 20)
    private String customerPhoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "trip_type", nullable = false, length = 30)
    private TripType tripType;

    @Column(name = "passenger_count", nullable = false)
    private Integer passengerCount;

    @Column(name = "pickup_location", nullable = false, length = 150)
    private String pickupLocation;

    @Column(name = "dropoff_location", nullable = false, length = 150)
    private String dropoffLocation;

    @Column(name = "start_date_time", nullable = false)
    private LocalDateTime startDateTime;

    @Column(name = "end_date_time")
    private LocalDateTime endDateTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public Booking(Long id, String bookingReference, CustomerProfile customer, Vehicle vehicle, DriverProfile driver,
                   String customerPhoneNumber, TripType tripType, Integer passengerCount,
                   String pickupLocation, String dropoffLocation,
                   LocalDateTime startDateTime, LocalDate startDate,
                   LocalDateTime endDateTime, LocalDate endDate,
                   BookingStatus status,
                   String rejectionReason, String notes, LocalDateTime cancelledAt,
                   LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.bookingReference = bookingReference;
        this.customer = customer;
        this.vehicle = vehicle;
        this.driver = driver;
        this.customerPhoneNumber = customerPhoneNumber;
        this.tripType = tripType;
        this.passengerCount = passengerCount;
        this.pickupLocation = pickupLocation;
        this.dropoffLocation = dropoffLocation;
        this.startDateTime = startDateTime != null ? startDateTime : (startDate != null ? startDate.atStartOfDay() : null);
        this.endDateTime = endDateTime != null ? endDateTime : (endDate != null ? endDate.atTime(23, 59, 59) : null);
        this.status = status != null ? status : BookingStatus.PENDING;
        this.rejectionReason = rejectionReason;
        this.notes = notes;
        this.cancelledAt = cancelledAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = BookingStatus.PENDING;
        }
        if (this.bookingReference == null && this.customer != null) {
            this.bookingReference = "BK-" + Long.toHexString(System.currentTimeMillis()).toUpperCase();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Backwards-compatibility helpers
    public LocalDate getStartDate() {
        return startDateTime != null ? startDateTime.toLocalDate() : null;
    }

    public void setStartDate(LocalDate date) {
        this.startDateTime = date != null ? date.atStartOfDay() : null;
    }

    public LocalDate getEndDate() {
        return endDateTime != null ? endDateTime.toLocalDate() : null;
    }

    public void setEndDate(LocalDate date) {
        this.endDateTime = date != null ? date.atTime(23, 59, 59) : null;
    }
}

