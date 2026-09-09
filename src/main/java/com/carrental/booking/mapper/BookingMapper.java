package com.carrental.booking.mapper;

import com.carrental.booking.dto.response.BookingResponse;
import com.carrental.booking.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookingMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", expression = "java(booking.getCustomer() != null ? booking.getCustomer().getFullName() : null)")
    @Mapping(target = "customerEmail", source = "customer.email")
    @Mapping(target = "vehicleId", source = "vehicle.id")
    @Mapping(target = "vehicleName", expression = "java(booking.getVehicle() != null ? booking.getVehicle().getBrand() + \" \" + booking.getVehicle().getModel() : null)")
    @Mapping(target = "vehicleLicensePlate", source = "vehicle.licensePlate")
    @Mapping(target = "driverId", source = "driver.id")
    @Mapping(target = "driverName", expression = "java(booking.getDriver() != null ? booking.getDriver().getFullName() : null)")
    @Mapping(target = "driverPhoneNumber", expression = "java(booking.getDriver() != null ? booking.getDriver().getPhoneNumber() : null)")
    BookingResponse toResponse(Booking booking);
}

