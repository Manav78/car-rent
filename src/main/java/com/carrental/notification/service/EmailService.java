package com.carrental.notification.service;

public interface EmailService {

    void sendVerificationEmail(String toEmail, String name, String token);

    void sendPasswordResetEmail(String toEmail, String name, String token);

    void sendBookingConfirmationEmail(String toEmail, String name, String bookingReference, String vehicleDetails);
    
    void sendBookingConfirmationEmail(com.carrental.booking.entity.Booking booking);
    
    void sendDriverReplacementEmail(com.carrental.booking.entity.Booking booking, com.carrental.driver.entity.DriverProfile oldDriver, com.carrental.driver.entity.DriverProfile newDriver, String reason);

    void sendVehicleReplacementEmail(com.carrental.booking.entity.Booking booking, com.carrental.vehicle.entity.Vehicle oldVehicle, com.carrental.vehicle.entity.Vehicle newVehicle, String reason);
}

