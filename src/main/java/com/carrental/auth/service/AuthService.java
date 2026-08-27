package com.carrental.auth.service;

import com.carrental.auth.dto.request.ForgotPasswordRequest;
import com.carrental.auth.dto.request.LoginRequest;
import com.carrental.auth.dto.request.RefreshTokenRequest;
import com.carrental.auth.dto.request.ResetPasswordRequest;
import com.carrental.auth.dto.response.AuthResponse;
import com.carrental.auth.dto.response.TokenRefreshResponse;
import com.carrental.auth.dto.response.UserResponse;
import com.carrental.auth.dto.request.VerifyEmailRequest;
import com.carrental.customer.dto.CustomerSignupRequest;
import com.carrental.owner.dto.OwnerSignupRequest;

public interface AuthService {

    UserResponse registerCustomer(CustomerSignupRequest request);

    UserResponse registerOwner(OwnerSignupRequest request);

    AuthResponse login(LoginRequest request);

    TokenRefreshResponse refreshToken(RefreshTokenRequest request);

    void verifyEmail(VerifyEmailRequest request);

    void verifyEmail(String token);

    void resendVerificationOtp(String email);

    void resendVerificationEmail(String email);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void logout(String email);

    UserResponse getCurrentUser();
}
