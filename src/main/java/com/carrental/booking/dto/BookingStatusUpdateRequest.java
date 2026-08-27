package com.carrental.booking.dto;

import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusUpdateRequest {
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
}
