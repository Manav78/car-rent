package com.carrental.owner.validation;

import com.carrental.customer.dto.CustomerSignupRequest;
import com.carrental.owner.dto.OwnerSignupRequest;
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
                .confirmPassword("password123")
                .phoneNumber("9876543210")
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
                .confirmPassword("password123")
                .phoneNumber("9876543210")
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
                .confirmPassword("password123")
                .phoneNumber("9876543210")
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
                .confirmPassword("password123")
                .phoneNumber("9876543210")
                .willingToDrive(true)
                .drivingLicenseNumber("DL-123456")
                .licenseExpiryDate(LocalDate.now().plusYears(3))
                .build();

        Set<ConstraintViolation<OwnerSignupRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    @Test
    @DisplayName("Customer signup fails with invalid email, short password, missing confirmPassword, and invalid phone")
    void testCustomerValidationErrors() {
        CustomerSignupRequest request = CustomerSignupRequest.builder()
                .firstName("")
                .lastName("Doe")
                .email("invalid-email")
                .password("123")
                .confirmPassword(null)
                .phoneNumber("abc")
                .build();

        Set<ConstraintViolation<CustomerSignupRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.size() >= 4);
    }

    @Test
    @DisplayName("Customer signup fails when phone number is missing or invalid Indian mobile number")
    void testCustomerPhoneNumberValidationErrors() {
        CustomerSignupRequest requestMissingPhone = CustomerSignupRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .password("password123")
                .confirmPassword("password123")
                .phoneNumber(null)
                .build();

        Set<ConstraintViolation<CustomerSignupRequest>> violationsNull = validator.validate(requestMissingPhone);
        assertFalse(violationsNull.isEmpty());

        CustomerSignupRequest requestInvalidPhone = CustomerSignupRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .password("password123")
                .confirmPassword("password123")
                .phoneNumber("1234567890") // starts with 1, not 6-9
                .build();

        Set<ConstraintViolation<CustomerSignupRequest>> violationsInvalid = validator.validate(requestInvalidPhone);
        assertFalse(violationsInvalid.isEmpty());
        assertTrue(violationsInvalid.stream().anyMatch(v -> v.getMessage().contains("10-digit Indian mobile number")));
    }

    @Test
    @DisplayName("Owner signup fails when phone number is missing or invalid")
    void testOwnerPhoneNumberValidationErrors() {
        OwnerSignupRequest request = OwnerSignupRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .password("password123")
                .confirmPassword("password123")
                .phoneNumber("5555555555") // starts with 5
                .willingToDrive(false)
                .build();

        Set<ConstraintViolation<OwnerSignupRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("10-digit Indian mobile number")));
    }
}
