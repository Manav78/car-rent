package com.carrental.booking.repository;

import com.carrental.booking.entity.Booking;
import com.carrental.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Booking> findByVehicleOwnerIdOrderByCreatedAtDesc(Long ownerId);

    List<Booking> findByDriverIdOrderByCreatedAtDesc(Long driverId);

    List<Booking> findByBookingStatus(BookingStatus bookingStatus);

    long countByBookingStatus(BookingStatus bookingStatus);

    @Query("SELECT COALESCE(SUM(b.finalAgreedAmount), 0) FROM Booking b WHERE (b.bookingStatus = 'COMPLETED' OR b.paymentStatus = 'PAID') AND b.finalAgreedAmount IS NOT NULL")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.bookingStatus NOT IN ('CANCELLED', 'REJECTED') " +
           "AND ((b.startDate <= :endDate AND b.endDate >= :startDate))")
    boolean existsConflictingBooking(@Param("vehicleId") Long vehicleId,
                                    @Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate);
}
