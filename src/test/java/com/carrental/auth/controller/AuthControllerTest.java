package com.carrental.auth.controller;

import com.carrental.auth.dto.request.LoginRequest;
import com.carrental.auth.dto.request.RefreshTokenRequest;
import com.carrental.auth.dto.request.VerifyEmailRequest;
import com.carrental.auth.dto.response.AuthResponse;
import com.carrental.auth.dto.response.TokenRefreshResponse;
import com.carrental.auth.dto.response.UserResponse;
import com.carrental.auth.enums.Role;
import com.carrental.auth.service.AuthService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.customer.dto.request.CustomerSignupRequest;
import com.carrental.owner.dto.request.OwnerSignupRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController Unit Tests")
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        userResponse = UserResponse.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .role(Role.CUSTOMER)
                .emailVerified(true)
                .isActive(true)
                .enabled(true)
                .build();
    }

    @Test
    @DisplayName("Should register customer successfully")
    void testRegisterCustomer() {
        CustomerSignupRequest request = new CustomerSignupRequest();
        request.setEmail("customer@example.com");
        request.setPassword("Password@123");
        request.setFirstName("John");
        request.setLastName("Doe");

        when(authService.registerCustomer(any(CustomerSignupRequest.class))).thenReturn(userResponse);

        ResponseEntity<ApiResponse<UserResponse>> response = authController.registerCustomer(request);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(authService).registerCustomer(any(CustomerSignupRequest.class));
    }

    @Test
    @DisplayName("Should register owner successfully")
    void testRegisterOwner() {
        OwnerSignupRequest request = new OwnerSignupRequest();
        request.setEmail("owner@example.com");
        request.setPassword("Password@123");

        when(authService.registerOwner(any(OwnerSignupRequest.class))).thenReturn(userResponse);

        ResponseEntity<ApiResponse<UserResponse>> response = authController.registerOwner(request);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(authService).registerOwner(any(OwnerSignupRequest.class));
    }

    @Test
    @DisplayName("Should login successfully")
    void testLogin() {
        LoginRequest request = new LoginRequest("test@example.com", "Password@123");
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("mock-access-token")
                .refreshToken("mock-refresh-token")
                .user(userResponse)
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        ResponseEntity<ApiResponse<AuthResponse>> response = authController.login(request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("mock-access-token", response.getBody().getData().getAccessToken());
        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    @DisplayName("Should refresh token successfully")
    void testRefreshToken() {
        RefreshTokenRequest request = new RefreshTokenRequest("valid-refresh-token");
        TokenRefreshResponse refreshResponse = TokenRefreshResponse.builder()
                .accessToken("new-access-token")
                .refreshToken("valid-refresh-token")
                .tokenType("Bearer")
                .expiresIn(3600L)
                .build();

        when(authService.refreshToken(any(RefreshTokenRequest.class))).thenReturn(refreshResponse);

        ResponseEntity<ApiResponse<TokenRefreshResponse>> response = authController.refreshToken(request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("new-access-token", response.getBody().getData().getAccessToken());
    }

    @Test
    @DisplayName("Should verify email by OTP")
    void testVerifyEmail() {
        VerifyEmailRequest request = new VerifyEmailRequest("test@example.com", "123456");
        doNothing().when(authService).verifyEmail(any(VerifyEmailRequest.class));

        ResponseEntity<ApiResponse<Void>> response = authController.verifyEmail(request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authService).verifyEmail(any(VerifyEmailRequest.class));
    }
}

