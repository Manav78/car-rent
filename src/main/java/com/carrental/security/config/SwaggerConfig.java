package com.carrental.security.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    @Value("${app.backend.url:http://localhost:8080}")
    private String backendUrl;

    @Bean
    public OpenAPI carRentalOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Car Rental Management System API")
                        .description("Comprehensive REST API documentation for the Car Rental Management System.\n\n" +
                                "### Authentication\n" +
                                "Endpoints requiring authorization are protected with JWT Bearer authentication.\n" +
                                "1. Call `/api/auth/login` to obtain an access token.\n" +
                                "2. Click the **Authorize** button at the top right.\n" +
                                "3. Paste your token (with or without 'Bearer ') and click **Authorize**.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Car Rental Support Team")
                                .email("support@carrental.com")
                                .url("https://www.carrental.com"))
                        .license(new License()
                                .name("Apache License Version 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server().url(backendUrl).description("Current Environment Server"),
                        new Server().url("http://localhost:8080").description("Local Development Server")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter your JWT token (e.g. eyJhbGciOi...)")));
    }
}

