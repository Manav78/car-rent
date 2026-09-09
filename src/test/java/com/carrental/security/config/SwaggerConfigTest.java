package com.carrental.security.config;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class SwaggerConfigTest {

    @Test
    @DisplayName("carRentalOpenAPI produces configured OpenAPI bean")
    void testCarRentalOpenAPI() {
        SwaggerConfig config = new SwaggerConfig();
        ReflectionTestUtils.setField(config, "backendUrl", "http://localhost:8080");

        OpenAPI openAPI = config.carRentalOpenAPI();

        assertThat(openAPI).isNotNull();
        assertThat(openAPI.getInfo()).isNotNull();
        assertThat(openAPI.getInfo().getTitle()).contains("Car Rental");
        assertThat(openAPI.getComponents().getSecuritySchemes()).containsKey("Bearer Authentication");
    }
}

