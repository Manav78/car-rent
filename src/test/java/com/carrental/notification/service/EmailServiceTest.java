package com.carrental.notification.service;

import com.carrental.notification.service.impl.EmailServiceImpl;

import com.carrental.auth.entity.User;
import com.carrental.booking.entity.Booking;
import com.carrental.booking.enums.BookingStatus;
import com.carrental.booking.enums.TripType;
import com.carrental.vehicle.entity.Vehicle;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.IContext;

import java.time.LocalDate;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TemplateEngine templateEngine;

    @InjectMocks
    private EmailServiceImpl emailService;

    private MimeMessage mimeMessage;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "frontendUrl", "http://localhost:3000");
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@carrental.com");

        mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        org.mockito.Mockito.lenient().when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Test
    @DisplayName("sendVerificationEmail - sends successfully with template")
    void testSendVerificationEmail_WithTemplate() {
        when(templateEngine.process(anyString(), any(IContext.class))).thenReturn("<html>OTP: 123456</html>");

        assertThatCode(() -> emailService.sendVerificationEmail("user@test.com", "John Doe", "123456"))
                .doesNotThrowAnyException();

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendVerificationEmail - falls back to default html when template fails")
    void testSendVerificationEmail_TemplateFallback() {
        when(templateEngine.process(anyString(), any(IContext.class))).thenThrow(new RuntimeException("Template not found"));

        assertThatCode(() -> emailService.sendVerificationEmail("user@test.com", "John Doe", "123456"))
                .doesNotThrowAnyException();

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendPasswordResetEmail - sends reset email")
    void testSendPasswordResetEmail() {
        assertThatCode(() -> emailService.sendPasswordResetEmail("user@test.com", "John Doe", "reset-token-123"))
                .doesNotThrowAnyException();

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendBookingConfirmationEmail with Booking object")
    void testSendBookingConfirmationEmail_WithBooking() {
        User customer = User.builder().firstName("John").lastName("Doe").email("john@test.com").build();
        Vehicle vehicle = Vehicle.builder().brand("Toyota").model("Corolla").build();
        Booking booking = Booking.builder()
                .bookingReference("BK-12345")
                .customer(customer)
                .vehicle(vehicle)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(3))
                .status(BookingStatus.CONFIRMED)
                .tripType(TripType.LOCAL)
                .pickupLocation("Airport")
                .dropoffLocation("Hotel")
                .build();

        when(templateEngine.process(anyString(), any(IContext.class))).thenReturn("<html>Booking Confirmed</html>");

        assertThatCode(() -> emailService.sendBookingConfirmationEmail(booking))
                .doesNotThrowAnyException();

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendBookingConfirmationEmail with null customer does not send")
    void testSendBookingConfirmationEmail_NullCustomer() {
        Booking booking = Booking.builder().bookingReference("BK-12345").build();

        assertThatCode(() -> emailService.sendBookingConfirmationEmail(booking))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("sendBookingConfirmationEmail with parameters")
    void testSendBookingConfirmationEmail_WithParameters() {
        when(templateEngine.process(anyString(), any(IContext.class))).thenReturn("<html>Booking Confirmed</html>");

        assertThatCode(() -> emailService.sendBookingConfirmationEmail("user@test.com", "John", "BK-123", "Toyota Camry"))
                .doesNotThrowAnyException();

        verify(mailSender).send(any(MimeMessage.class));
    }
}

