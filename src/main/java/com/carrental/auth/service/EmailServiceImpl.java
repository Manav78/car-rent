package com.carrental.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@carrental.com}")
    private String fromEmail;

    @Override
    public void sendVerificationEmail(String toEmail, String name, String token) {
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;
        String subject = "Verify Your Car Rental Account";

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #2c3e50; text-align: center;">Welcome to Car Rental, %s!</h2>
                    <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
                    </div>
                    <p>Or use this verification token directly: <strong style="color: #2c3e50;">%s</strong></p>
                    <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">If you did not register for this account, please ignore this email.</p>
                </div>
                """.formatted(name, verificationUrl, token);

        sendHtmlEmail(toEmail, subject, htmlContent, "Verification Token: " + token);
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
