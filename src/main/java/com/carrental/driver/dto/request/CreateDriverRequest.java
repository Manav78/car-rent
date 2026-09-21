package com.carrental.driver.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDriverRequest {

    private String name;

    private String firstName;

    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotNull(message = "License expiry date is required")
    @Future(message = "License expiry date must be in the future")
    private LocalDate licenseExpiryDate;

    private String licenseFrontImage;

    private String licenseBackImage;

    public String getResolvedName() {
        if (name != null && !name.isBlank()) {
            return name.trim();
        }
        String first = firstName != null ? firstName.trim() : "";
        String last = lastName != null ? lastName.trim() : "";
        return (first + " " + last).trim();
    }
}
