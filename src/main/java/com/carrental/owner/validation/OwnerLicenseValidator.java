package com.carrental.owner.validation;

import com.carrental.owner.validation.ValidOwnerLicense;
import com.carrental.owner.dto.request.OwnerSignupRequest;
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
            boolean isValid = true;
            context.disableDefaultConstraintViolation();

            if (request.getDrivingLicenseNumber() == null || request.getDrivingLicenseNumber().trim().isEmpty()) {
                context.buildConstraintViolationWithTemplate("Driving license number is required when willing to drive")
                        .addPropertyNode("drivingLicenseNumber")
                        .addConstraintViolation();
                isValid = false;
            }

            if (request.getLicenseExpiryDate() == null) {
                context.buildConstraintViolationWithTemplate("License expiry date is required when willing to drive")
                        .addPropertyNode("licenseExpiryDate")
                        .addConstraintViolation();
                isValid = false;
            } else if (!request.getLicenseExpiryDate().isAfter(LocalDate.now())) {
                context.buildConstraintViolationWithTemplate("License expiry date must be a future date")
                        .addPropertyNode("licenseExpiryDate")
                        .addConstraintViolation();
                isValid = false;
            }

            return isValid;
        }

        return true;
    }
}

