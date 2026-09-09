package com.carrental.booking.dto.response;

import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.enums.TripType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingReference;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhoneNumber;
    private Long vehicleId;
    private String vehicleName;
    private String vehicleLicensePlate;
    private Long driverId;
    private String driverName;
    private String driverPhoneNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private String pickupLocation;
    private String dropoffLocation;
    private TripType tripType;
    private Integer passengerCount;
    private BookingStatus bookingStatus;
    private String rejectionReason;
    private String notes;
    private LocalDateTime createdAt;
}


