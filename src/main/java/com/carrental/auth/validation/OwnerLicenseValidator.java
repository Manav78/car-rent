package com.carrental.auth.validation;

import com.carrental.auth.annotation.ValidOwnerLicense;
import com.carrental.auth.dto.request.OwnerSignupRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;

public class OwnerLicenseValidator implements ConstraintValidator<ValidOwnerLicense, OwnerSignupRequest> {

    @Override
    public boolean isValid(OwnerSignupRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return true;
        }

        if (Boolean.TRUE.equals(request.getWillingToDrive())) {
            boolean valid = true;
            context.disableDefaultConstraintViolation();

            if (request.getDrivingLicenseNumber() == null || request.getDrivingLicenseNumber().trim().isEmpty()) {
                context.buildConstraintViolationWithTemplate("Driving license number is required when willing to drive")
                        .addPropertyNode("drivingLicenseNumber")
                        .addConstraintViolation();
                valid = false;
            }

            if (request.getLicenseExpiryDate() == null) {
                context.buildConstraintViolationWithTemplate("License expiry date is required when willing to drive")
                        .addPropertyNode("licenseExpiryDate")
                        .addConstraintViolation();
                valid = false;
            } else if (!request.getLicenseExpiryDate().isAfter(LocalDate.now())) {
                context.buildConstraintViolationWithTemplate("License expiry date must be a future date")
                        .addPropertyNode("licenseExpiryDate")
                        .addConstraintViolation();
                valid = false;
            }

            return valid;
        }

        return true;
    }
}
