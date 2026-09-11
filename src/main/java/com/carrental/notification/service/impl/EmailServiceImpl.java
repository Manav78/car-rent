package com.carrental.notification.service.impl;

import com.carrental.notification.service.EmailService;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@carrental.com}")
    private String fromEmail;

    @Override
    public void sendVerificationEmail(String toEmail, String name, String otp) {
        String subject = "Verify Your Car Rental Account - OTP: " + otp;
        String htmlContent;

        try {
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("otp", otp);
            context.setVariable("expiryMinutes", 1);
            htmlContent = templateEngine.process("email/email-verification", context);
        } catch (Exception e) {
            log.warn("Thymeleaf template rendering failed for email verification, falling back to default HTML: {}", e.getMessage());
            htmlContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h2 style="color: #2c3e50; text-align: center;">Welcome to Car Rental, %s!</h2>
                        <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your account:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; background-color: #eff6ff; padding: 10px 20px; border-radius: 6px; border: 1px dashed #2563eb;">%s</span>
                        </div>
                        <p style="color: #e74c3c; font-size: 13px;">This OTP will expire in 1 minute.</p>
                        <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">If you did not register for this account, please ignore this email.</p>
                    </div>
                    """.formatted(name, otp);
        }

        sendHtmlEmail(toEmail, subject, htmlContent, "Verification OTP: " + otp);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String name, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String subject = "Reset Your Car Rental Password";

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #2c3e50; text-align: center;">Password Reset Request</h2>
                    <p>Hello %s,</p>
                    <p>We received a request to reset the password for your Car Rental account. Click the button below to set a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    <p>Or use this reset token directly: <strong style="color: #2c3e50;">%s</strong></p>
                    <p style="color: #e74c3c; font-size: 13px;">This link and token will expire in 15 minutes.</p>
                    <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                </div>
                """.formatted(name, resetUrl, token);

        sendHtmlEmail(toEmail, subject, htmlContent, "Password Reset Token: " + token);
    }

    @Override
    public void sendBookingConfirmationEmail(com.carrental.booking.entity.Booking booking) {
        if (booking == null || booking.getCustomer() == null) {
            log.warn("Cannot send booking confirmation email: booking or customer is null");
            return;
        }

        String toEmail = booking.getCustomer().getEmail();
        String name = booking.getCustomer().getFullName();
        String bookingReference = booking.getBookingReference();
        String subject = "Booking Confirmation - " + bookingReference;

        String htmlContent;
        try {
            Context context = new Context();
            context.setVariable("customerName", name);
            context.setVariable("name", name);
            context.setVariable("bookingReference", bookingReference);
            context.setVariable("bookingStatus", booking.getStatus() != null ? booking.getStatus().name() : "CONFIRMED");
            context.setVariable("status", booking.getStatus() != null ? booking.getStatus().name() : "CONFIRMED");
            context.setVariable("vehicleBrand", booking.getVehicle() != null ? booking.getVehicle().getBrand() : "N/A");
            context.setVariable("vehicleModel", booking.getVehicle() != null ? booking.getVehicle().getModel() : "N/A");
            context.setVariable("vehicleType", booking.getVehicle() != null && booking.getVehicle().getVehicleType() != null ? booking.getVehicle().getVehicleType().name() : "N/A");
            context.setVariable("licensePlate", booking.getVehicle() != null ? booking.getVehicle().getLicensePlate() : "N/A");
            context.setVariable("pickupLocation", booking.getPickupLocation());
            context.setVariable("dropoffLocation", booking.getDropoffLocation());
            context.setVariable("startDate", booking.getStartDate());
            context.setVariable("endDate", booking.getEndDate());
            context.setVariable("tripType", booking.getTripType() != null ? booking.getTripType().name() : "N/A");
            context.setVariable("passengerCount", booking.getPassengerCount());
            context.setVariable("driverName", booking.getDriver() != null ? booking.getDriver().getFullName() : null);
            context.setVariable("driverPhone", booking.getDriver() != null ? booking.getDriver().getPhoneNumber() : null);

            try {
                htmlContent = templateEngine.process("email/booking-confirmation", context);
            } catch (Exception tplEx) {
                htmlContent = templateEngine.process("booking-confirmation", context);
            }

            if (htmlContent == null || htmlContent.isBlank()) {
                throw new IllegalStateException("Rendered template is null or blank");
            }
        } catch (Exception e) {
            log.warn("Thymeleaf template rendering failed for booking confirmation, falling back to default HTML: {}", e.getMessage());
            String vehicleDetails = (booking.getVehicle() != null) ? booking.getVehicle().getBrand() + " " + booking.getVehicle().getModel() : "your vehicle";
            htmlContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h2 style="color: #27ae60; text-align: center;">Booking Confirmed!</h2>
                        <p>Hello %s,</p>
                        <p>Your booking <strong>%s</strong> for <strong>%s</strong> has been successfully confirmed.</p>
                        <p>Thank you for choosing Car Rental Services!</p>
                    </div>
                    """.formatted(name, bookingReference, vehicleDetails);
        }

        sendHtmlEmail(toEmail, subject, htmlContent, "Booking Ref: " + bookingReference);
    }

    @Override
    public void sendBookingConfirmationEmail(String toEmail, String name, String bookingReference, String vehicleDetails) {
        String subject = "Booking Confirmation - " + bookingReference;
        String htmlContent;

        try {
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("customerName", name);
            context.setVariable("bookingReference", bookingReference);
            context.setVariable("bookingStatus", "CONFIRMED");
            context.setVariable("vehicleBrand", vehicleDetails);
            context.setVariable("vehicleModel", "");
            context.setVariable("vehicleType", "");
            context.setVariable("licensePlate", "");
            context.setVariable("pickupLocation", "As selected in booking");
            context.setVariable("dropoffLocation", "As selected in booking");
            context.setVariable("startDate", "");
            context.setVariable("endDate", "");
            context.setVariable("tripType", "");
            context.setVariable("passengerCount", "");

            try {
                htmlContent = templateEngine.process("email/booking-confirmation", context);
            } catch (Exception tplEx) {
                htmlContent = templateEngine.process("booking-confirmation", context);
            }

            if (htmlContent == null || htmlContent.isBlank()) {
                throw new IllegalStateException("Rendered template is null or blank");
            }
        } catch (Exception e) {
            log.warn("Thymeleaf template rendering failed for booking confirmation, falling back to default HTML: {}", e.getMessage());
            htmlContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h2 style="color: #27ae60; text-align: center;">Booking Confirmed!</h2>
                        <p>Hello %s,</p>
                        <p>Your booking <strong>%s</strong> has been successfully confirmed for <strong>%s</strong>.</p>
                        <p>Thank you for choosing our Car Rental Service!</p>
                    </div>
                    """.formatted(name, bookingReference, vehicleDetails);
        }

        sendHtmlEmail(toEmail, subject, htmlContent, "Booking Ref: " + bookingReference);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody, String fallbackLogInfo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Email sent successfully to: {} [Subject: {}]", to, subject);
        } catch (Exception e) {
            log.warn("Failed to send email to {} via SMTP server ({}). Logging details: {}", to, e.getMessage(), fallbackLogInfo);
        }
    }
}

