package com.carrental.booking.repository;

import com.carrental.booking.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    Optional<Trip> findByBookingId(Long bookingId);
    List<Trip> findByStatus(String status);
}

