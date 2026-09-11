package com.carrental.booking.dto.request;

import com.carrental.booking.enums.BookingStatus;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusUpdateRequest {

    @NotNull(message = "Booking status is required")
    @JsonAlias({"bookingStatus", "status"})
    private BookingStatus status;

    public BookingStatus getBookingStatus() {
        return status;
    }

    public void setBookingStatus(BookingStatus bookingStatus) {
        this.status = bookingStatus;
    }
}
