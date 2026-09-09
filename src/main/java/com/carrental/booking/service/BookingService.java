package com.carrental.booking.service;

import com.carrental.booking.dto.request.BookingRequest;
import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.dto.request.BookingStatusUpdateRequest;

import com.carrental.security.service.UserDetailsImpl;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(Long customerId, BookingRequest request);

    BookingResponse getBookingById(Long id);

    BookingResponse getBookingById(UserDetailsImpl userDetails, Long id);

    List<BookingResponse> getCustomerBookings(Long customerId);

    List<BookingResponse> getCustomerHistory(Long customerId);

    List<BookingResponse> getOwnerBookings(Long ownerId);

    List<BookingResponse> getDriverBookings(Long driverId);

    BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request);
}

