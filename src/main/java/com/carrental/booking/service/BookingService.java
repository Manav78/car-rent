package com.carrental.booking.service;

import com.carrental.booking.dto.request.BookingRequest;
import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.dto.request.BookingStatusUpdateRequest;

import com.carrental.booking.enums.BookingStatus;
import com.carrental.security.service.UserDetailsImpl;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(Long customerId, BookingRequest request);

    BookingResponse getBookingById(Long id);

    BookingResponse getBookingById(UserDetailsImpl userDetails, Long id);

    List<BookingResponse> getCustomerBookings(Long customerId);

    List<BookingResponse> getCustomerHistory(Long customerId);

    List<BookingResponse> getOwnerBookings(Long ownerId);

    List<BookingResponse> getOwnerBookingsByStatus(Long ownerId, BookingStatus status);

    List<BookingResponse> getDriverBookings(Long driverId);

    BookingResponse assignDriver(UserDetailsImpl userDetails, Long bookingId, Long driverId);

    BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request);

    BookingResponse updateBookingStatus(UserDetailsImpl userDetails, Long bookingId, BookingStatusUpdateRequest request);

    BookingResponse updateDriverTripStatus(UserDetailsImpl userDetails, Long bookingId, BookingStatusUpdateRequest request);
}

