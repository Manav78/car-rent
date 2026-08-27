package com.carrental.booking.service;

import com.carrental.booking.dto.BookingRequest;
import com.carrental.booking.dto.BookingResponse;
import com.carrental.booking.dto.BookingStatusUpdateRequest;

import com.carrental.security.service.UserDetailsImpl;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(Long customerId, BookingRequest request);

    BookingResponse getBookingById(Long id);

    BookingResponse getBookingById(UserDetailsImpl userDetails, Long id);

    BookingResponse getBookingByReference(String reference);

    BookingResponse getBookingByReference(UserDetailsImpl userDetails, String reference);

    List<BookingResponse> getCustomerBookings(Long customerId);

    List<BookingResponse> getOwnerBookings(Long ownerId);

    List<BookingResponse> getDriverBookings(Long driverId);

    BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request);

    void cancelBooking(Long customerId, Long bookingId);
}
