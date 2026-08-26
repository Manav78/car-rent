package com.carrental.auth.service;

import com.carrental.auth.dto.request.CustomerSignupRequest;
import com.carrental.auth.dto.request.ForgotPasswordRequest;
import com.carrental.auth.dto.request.LoginRequest;
import com.carrental.auth.dto.request.OwnerSignupRequest;
import com.carrental.auth.dto.request.RefreshTokenRequest;
import com.carrental.auth.dto.request.ResetPasswordRequest;
import com.carrental.auth.dto.response.AuthResponse;
import com.carrental.auth.dto.response.TokenRefreshResponse;
import com.carrental.auth.dto.response.UserResponse;
import com.carrental.auth.entity.EmailVerificationToken;
import com.carrental.auth.entity.PasswordResetToken;
import com.carrental.auth.entity.RefreshToken;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.exception.AuthException;
import com.carrental.auth.exception.BadRequestException;
import com.carrental.auth.exception.InvalidTokenException;
import com.carrental.auth.exception.ResourceNotFoundException;
import com.carrental.auth.exception.TokenRefreshException;
import com.carrental.auth.exception.UserAlreadyExistsException;
import com.carrental.auth.mapper.AuthMapper;
import com.carrental.auth.repository.EmailVerificationTokenRepository;
import com.carrental.auth.repository.PasswordResetTokenRepository;
import com.carrental.auth.repository.UserRepository;
import com.carrental.auth.security.JwtTokenProvider;
import com.carrental.auth.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public UserResponse registerCustomer(CustomerSignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        User user = authMapper.toCustomerEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_CUSTOMER);
        user.setWillingToDrive(false);
        user.setEmailVerified(false);
        user.setAccountNonLocked(true);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        createAndSendVerificationToken(savedUser);

        log.info("Customer registered successfully with email: {}", savedUser.getEmail());
        return authMapper.toUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse registerOwner(OwnerSignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        User user = authMapper.toOwnerEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_OWNER);
        user.setEmailVerified(false);
        user.setAccountNonLocked(true);
        user.setEnabled(true);

        if (Boolean.TRUE.equals(request.getWillingToDrive())) {
            user.setWillingToDrive(true);
            user.setDrivingLicenseNumber(request.getDrivingLicenseNumber());
            user.setLicenseExpiryDate(request.getLicenseExpiryDate());
        } else {
            user.setWillingToDrive(false);
            user.setDrivingLicenseNumber(null);
            user.setLicenseExpiryDate(null);
        }

        User savedUser = userRepository.save(user);

        createAndSendVerificationToken(savedUser);

        log.info("Owner registered successfully with email: {} (Willing to drive: {})",
                savedUser.getEmail(), savedUser.getWillingToDrive());
        return authMapper.toUserResponse(savedUser);
    }

    private void createAndSendVerificationToken(User user) {
        emailVerificationTokenRepository.deleteByUser(user);

        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();

        emailVerificationTokenRepository.save(verificationToken);
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verificationToken.getToken());
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
    public TokenRefreshResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = jwtTokenProvider.generateAccessToken(
                            user.getId(),
                            user.getEmail(),
                            user.getFirstName(),
                            user.getLastName(),
                            user.getRole().name()
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
    public void verifyEmail(String tokenStr) {
        EmailVerificationToken token = emailVerificationTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new InvalidTokenException("Invalid email verification token"));

        if (token.isExpired()) {
            emailVerificationTokenRepository.delete(token);
            throw new InvalidTokenException("Email verification token has expired. Please request a new one.");
        }

        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        emailVerificationTokenRepository.delete(token);
        log.info("Email verified successfully for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        createAndSendVerificationToken(user);
        log.info("Resent verification email to: {}", email);
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
