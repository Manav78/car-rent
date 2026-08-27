package com.carrental.owner.annotation;

import com.carrental.owner.validation.OwnerLicenseValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = OwnerLicenseValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidOwnerLicense {

    String message() default "Driving license number and valid future expiry date are required when willing to drive";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
