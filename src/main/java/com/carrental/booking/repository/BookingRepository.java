package com.carrental.booking.repository;

import com.carrental.booking.entity.Booking;
import com.carrental.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    boolean existsByVehicleId(Long vehicleId);

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("SELECT b FROM Booking b WHERE b.customer.id = :customerId AND b.status IN :statuses ORDER BY b.createdAt DESC")
    List<Booking> findByCustomerIdAndBookingStatusInOrderByCreatedAtDesc(@Param("customerId") Long customerId,
                                                                         @Param("statuses") java.util.Collection<BookingStatus> statuses);

    @Query("SELECT b FROM Booking b WHERE b.vehicle.owner.id = :ownerId ORDER BY b.createdAt DESC")
    List<Booking> findByVehicleOwnerIdOrderByCreatedAtDesc(@Param("ownerId") Long ownerId);

    @Query("SELECT b FROM Booking b WHERE b.vehicle.owner.id = :ownerId AND b.status = :status ORDER BY b.createdAt DESC")
    List<Booking> findByVehicleOwnerIdAndStatusOrderByCreatedAtDesc(@Param("ownerId") Long ownerId, @Param("status") BookingStatus status);

    List<Booking> findByDriverIdOrderByCreatedAtDesc(Long driverId);

    @Query("SELECT b FROM Booking b WHERE b.status = :status")
    List<Booking> findByBookingStatus(@Param("status") BookingStatus bookingStatus);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    long countByBookingStatus(@Param("status") BookingStatus bookingStatus);

    default BigDecimal calculateTotalRevenue() {
        return BigDecimal.ZERO;
    }

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.status NOT IN (com.carrental.booking.enums.BookingStatus.CANCELLED, com.carrental.booking.enums.BookingStatus.REJECTED) " +
           "AND ((b.startDateTime <= :endDateTime AND b.endDateTime >= :startDateTime))")
    boolean existsConflictingBookingDateTime(@Param("vehicleId") Long vehicleId,
                                           @Param("startDateTime") LocalDateTime startDateTime,
                                           @Param("endDateTime") LocalDateTime endDateTime);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.status NOT IN (com.carrental.booking.enums.BookingStatus.CANCELLED, com.carrental.booking.enums.BookingStatus.REJECTED, com.carrental.booking.enums.BookingStatus.COMPLETED) " +
           "AND ((CAST(b.startDateTime AS date) <= :endDate AND CAST(b.endDateTime AS date) >= :startDate))")
    boolean existsConflictingBooking(@Param("vehicleId") Long vehicleId,
                                     @Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.driver.id = :driverId " +
           "AND b.id != :excludeBookingId " +
           "AND b.status NOT IN (com.carrental.booking.enums.BookingStatus.CANCELLED, com.carrental.booking.enums.BookingStatus.REJECTED, com.carrental.booking.enums.BookingStatus.COMPLETED) " +
           "AND ((b.startDateTime <= :endDateTime AND b.endDateTime >= :startDateTime))")
    boolean existsConflictingDriverBooking(@Param("driverId") Long driverId,
                                           @Param("excludeBookingId") Long excludeBookingId,
                                           @Param("startDateTime") LocalDateTime startDateTime,
                                           @Param("endDateTime") LocalDateTime endDateTime);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.id != :excludeBookingId " +
           "AND b.status NOT IN (com.carrental.booking.enums.BookingStatus.CANCELLED, com.carrental.booking.enums.BookingStatus.REJECTED, com.carrental.booking.enums.BookingStatus.COMPLETED) " +
           "AND ((b.startDateTime <= :endDateTime AND b.endDateTime >= :startDateTime))")
    boolean existsConflictingVehicleBooking(@Param("vehicleId") Long vehicleId,
                                            @Param("excludeBookingId") Long excludeBookingId,
                                            @Param("startDateTime") LocalDateTime startDateTime,
                                            @Param("endDateTime") LocalDateTime endDateTime);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.driver.id = :driverId " +
           "AND b.id != :excludeBookingId " +
           "AND b.status = com.carrental.booking.enums.BookingStatus.IN_PROGRESS")
    boolean hasOtherInProgressBookingForDriver(@Param("driverId") Long driverId,
                                              @Param("excludeBookingId") Long excludeBookingId);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.id != :excludeBookingId " +
           "AND b.status = com.carrental.booking.enums.BookingStatus.IN_PROGRESS")
    boolean hasOtherInProgressBookingForVehicle(@Param("vehicleId") Long vehicleId,
                                               @Param("excludeBookingId") Long excludeBookingId);
}

