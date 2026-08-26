package com.carrental.auth.validation;

import com.carrental.auth.dto.request.CustomerSignupRequest;
import com.carrental.auth.dto.request.OwnerSignupRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class OwnerLicenseValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Owner not willing to drive does not require license details")
    void testOwnerNotWillingToDriveValidWithoutLicense() {
        OwnerSignupRequest request = OwnerSignupRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("password123")
                .phoneNumber("1234567890")
                .willingToDrive(false)
                .build();

        Set<ConstraintViolation<OwnerSignupRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Violations should be empty when willingToDrive is false");
    }

    @Test
    @DisplayName("Owner willing to drive fails validation without license number")
    void testOwnerWillingToDriveInvalidWithoutLicense() {
        OwnerSignupRequest request = OwnerSignupRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("password123")
                .phoneNumber("1234567890")
                .willingToDrive(true)
                .drivingLicenseNumber(null)
                .licenseExpiryDate(LocalDate.now().plusYears(1))
                .build();

        Set<ConstraintViolation<OwnerSignupRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Driving license number is required")));
    }

    @Test
    @DisplayName("Owner willing to drive fails validation with past license expiry date")
    void testOwnerWillingToDriveInvalidPastExpiryDate() {
        OwnerSignupRequest request = OwnerSignupRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("password123")
                .phoneNumber("1234567890")
                .willingToDrive(true)
                .drivingLicenseNumber("DL-123456")
                .licenseExpiryDate(LocalDate.now().minusDays(1))
                .build();

        Set<ConstraintViolation<OwnerSignupRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("License expiry date must be a future date")));
    }

    @Test
    @DisplayName("Owner willing to drive passes validation with valid license and future expiry")
    void testOwnerWillingToDriveValidWithProperLicense() {
        OwnerSignupRequest request = OwnerSignupRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("password123")
                .phoneNumber("1234567890")
                .willingToDrive(true)
                .drivingLicenseNumber("DL-123456")
                .licenseExpiryDate(LocalDate.now().plusYears(3))
                .build();

        Set<ConstraintViolation<OwnerSignupRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    @Test
    @DisplayName("Customer signup fails with invalid email and short password")
    void testCustomerValidationErrors() {
        CustomerSignupRequest request = CustomerSignupRequest.builder()
                .firstName("")
                .lastName("Doe")
                .email("invalid-email")
                .password("123")
                .phoneNumber("abc")
                .build();

        Set<ConstraintViolation<CustomerSignupRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertEquals(5, violations.size());
    }
}
