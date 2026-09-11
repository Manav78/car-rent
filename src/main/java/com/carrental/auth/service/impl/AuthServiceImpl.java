package com.carrental.auth.service.impl;

import com.carrental.auth.service.AuthService;
import com.carrental.auth.service.RefreshTokenService;

import com.carrental.auth.dto.request.ForgotPasswordRequest;
import com.carrental.auth.dto.request.LoginRequest;
import com.carrental.auth.dto.request.RefreshTokenRequest;
import com.carrental.auth.dto.request.ResetPasswordRequest;
import com.carrental.auth.dto.request.VerifyEmailRequest;
import com.carrental.auth.dto.response.AuthResponse;
import com.carrental.auth.dto.response.TokenRefreshResponse;
import com.carrental.auth.dto.response.UserResponse;
import com.carrental.auth.entity.EmailVerificationToken;
import com.carrental.auth.entity.PasswordResetToken;
import com.carrental.auth.entity.RefreshToken;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.exception.AuthException;
import com.carrental.auth.exception.InvalidTokenException;
import com.carrental.auth.exception.TokenRefreshException;
import com.carrental.auth.exception.UserAlreadyExistsException;
import com.carrental.auth.mapper.AuthMapper;
import com.carrental.auth.repository.EmailVerificationTokenRepository;
import com.carrental.auth.repository.PasswordResetTokenRepository;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.BadRequestException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.customer.dto.request.CustomerSignupRequest;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.notification.service.EmailService;
import com.carrental.owner.dto.request.OwnerSignupRequest;
import com.carrental.owner.entity.OwnerProfile;
import com.carrental.owner.enums.OwnerStatus;
import com.carrental.owner.repository.OwnerProfileRepository;
import com.carrental.security.jwt.JwtTokenProvider;
import com.carrental.security.service.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public UserResponse registerCustomer(CustomerSignupRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        User user = authMapper.toCustomerEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(Role.CUSTOMER);
        user.setEmailVerified(false);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        createAndSendVerificationToken(savedUser);

        log.info("Customer registered successfully with email: {}", savedUser.getEmail());
        return authMapper.toUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse registerOwner(OwnerSignupRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        User user = authMapper.toOwnerEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(Role.OWNER);
        user.setEmailVerified(false);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        OwnerProfile ownerProfile = OwnerProfile.builder()
                .user(savedUser)
                .status(OwnerStatus.PENDING)
                .build();
        ownerProfileRepository.save(ownerProfile);

        if (Boolean.TRUE.equals(request.getWillingToDrive())) {
            DriverProfile driverProfile = DriverProfile.builder()
                    .user(savedUser)
                    .drivingLicenseNumber(request.getDrivingLicenseNumber())
                    .licenseExpiryDate(request.getLicenseExpiryDate())
                    .status(DriverStatus.PENDING)
                    .build();
            driverProfileRepository.save(driverProfile);
        }

        createAndSendVerificationToken(savedUser);

        log.info("Owner registered successfully with email: {} (Willing to drive: {})",
                savedUser.getEmail(), request.getWillingToDrive());
        return authMapper.toUserResponse(savedUser);
    }

    private void createAndSendVerificationToken(User user) {
        emailVerificationTokenRepository.deleteByUser(user);

        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));

        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .token(otp)
                .expiryDate(Instant.now().plus(1, ChronoUnit.MINUTES))
                .build();

        emailVerificationTokenRepository.save(verificationToken);
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), otp);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new DisabledException("Account is disabled. Please verify your email first.");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new DisabledException("Account is deactivated.");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        log.info("User {} logged in successfully with role {}", user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(authMapper.toUserResponse(user))
                .build();
    }

    @Override
    @Transactional
    public AuthResponse adminLogin(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));

        boolean isAdmin = (user.getRoles() != null && (user.getRoles().contains(Role.ADMIN) || user.getRoles().contains(Role.ROLE_ADMIN)))
                || Role.ADMIN.equals(user.getRole());

        if (!isAdmin) {
            throw new BadRequestException("Access denied: Account is not an administrator.");
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new DisabledException("Account is disabled. Please verify your email first.");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new DisabledException("Account is deactivated.");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        log.info("Admin {} logged in successfully via admin login", user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(authMapper.toUserResponse(user))
                .build();
    }

    @Override
    @Transactional
    public TokenRefreshResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String roleName = user.getRole() != null ? user.getRole().name().replace("ROLE_", "") : "CUSTOMER";
                    String accessToken = jwtTokenProvider.generateAccessToken(
                            user.getId(),
                            user.getEmail(),
                            user.getFirstName(),
                            user.getLastName(),
                            roleName
                    );
                    return TokenRefreshResponse.builder()
                            .accessToken(accessToken)
                            .refreshToken(requestRefreshToken)
                            .tokenType("Bearer")
                            .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                            .build();
                })
                .orElseThrow(() -> new TokenRefreshException("Refresh token was not found in database"));
    }

    @Override
    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank() || request.getOtp() == null || request.getOtp().isBlank()) {
            throw new BadRequestException("Email and OTP are required for email verification");
        }

        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Email is already verified");
        }

        EmailVerificationToken token = emailVerificationTokenRepository.findByUser(user)
                .orElseThrow(() -> new InvalidTokenException("No verification OTP found for this user. Please request a new OTP."));

        if (token.isExpired()) {
            emailVerificationTokenRepository.delete(token);
            throw new InvalidTokenException("OTP has expired. Please request a new one.");
        }

        if (!token.getToken().equals(request.getOtp().trim())) {
            throw new InvalidTokenException("Invalid OTP. Please check the code sent to your email.");
        }

        user.setEmailVerified(true);
        userRepository.save(user);

        emailVerificationTokenRepository.delete(token);
        log.info("Email verified successfully for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void resendVerificationOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Email is already verified");
        }

        createAndSendVerificationToken(user);
        log.info("Resent verification OTP to: {}", email);
    }

    @Override
    @Transactional
    public void resendVerificationEmail(String email) {
        resendVerificationOtp(email);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUser(user);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .token(UUID.randomUUID().toString())
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .used(false)
                    .build();

            passwordResetTokenRepository.save(resetToken);
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetToken.getToken());
            log.info("Password reset token generated for user: {}", user.getEmail());
        });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid password reset token"));

        if (resetToken.isExpired() || resetToken.isUsed()) {
            throw new InvalidTokenException("Password reset token is expired or has already been used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        refreshTokenService.deleteByUser(user);
        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            refreshTokenService.deleteByUser(user);
            log.info("User {} logged out successfully", email);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AuthException("User is not authenticated");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return authMapper.toUserResponse(user);
    }
}

