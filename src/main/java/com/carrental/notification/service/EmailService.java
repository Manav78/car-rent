package com.carrental.notification.service;

public interface EmailService {

    void sendVerificationEmail(String toEmail, String name, String token);

    void sendPasswordResetEmail(String toEmail, String name, String token);

    void sendBookingConfirmationEmail(String toEmail, String name, String bookingReference, String vehicleDetails);
}
