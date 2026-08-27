package com.carrental.auth.service;

import com.carrental.auth.dto.request.LoginRequest;
import com.carrental.auth.dto.response.AuthResponse;
import com.carrental.auth.dto.response.UserResponse;
import com.carrental.auth.entity.EmailVerificationToken;
import com.carrental.auth.entity.RefreshToken;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.exception.UserAlreadyExistsException;
import com.carrental.auth.mapper.AuthMapper;
import com.carrental.auth.repository.EmailVerificationTokenRepository;
import com.carrental.auth.repository.PasswordResetTokenRepository;
import com.carrental.auth.repository.UserRepository;
import com.carrental.customer.dto.CustomerSignupRequest;
import com.carrental.notification.service.EmailService;
import com.carrental.owner.dto.OwnerSignupRequest;
import com.carrental.security.jwt.JwtTokenProvider;
import com.carrental.security.service.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.carrental.auth.dto.request.VerifyEmailRequest;
import com.carrental.auth.exception.InvalidTokenException;
import com.carrental.common.exception.BadRequestException;
import org.springframework.security.authentication.DisabledException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private EmailService emailService;

    @Mock
    private AuthMapper authMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private CustomerSignupRequest customerRequest;
    private OwnerSignupRequest ownerRequest;
    private User customerUser;
    private User ownerUser;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        customerRequest = CustomerSignupRequest.builder()
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@example.com")
                .password("Password@123")
                .confirmPassword("Password@123")
                .phoneNumber("9876543210")
                .build();

        ownerRequest = OwnerSignupRequest.builder()
                .firstName("Bob")
                .lastName("Builder")
                .email("bob@example.com")
                .password("Password@123")
                .confirmPassword("Password@123")
                .phoneNumber("9876543211")
                .willingToDrive(true)
                .drivingLicenseNumber("DL-12345678")
                .licenseExpiryDate(LocalDate.now().plusYears(2))
                .build();

        customerUser = User.builder()
                .id(1L)
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@example.com")
                .phoneNumber("9876543210")
                .emailVerified(false)
                .role(Role.ROLE_CUSTOMER)
                .build();

        ownerUser = User.builder()
                .id(2L)
                .firstName("Bob")
                .lastName("Builder")
                .email("bob@example.com")
                .phoneNumber("9876543211")
                .emailVerified(false)
                .role(Role.ROLE_OWNER)
                .willingToDrive(true)
                .drivingLicenseNumber("DL-12345678")
                .licenseExpiryDate(LocalDate.now().plusYears(2))
                .build();

        userResponse = UserResponse.builder()
                .id(1L)
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@example.com")
                .role(Role.ROLE_CUSTOMER)
                .build();
    }

    @Test
    @DisplayName("Should register customer successfully and send verification OTP")
    void testRegisterCustomerSuccess() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(anyString())).thenReturn(false);
        when(authMapper.toCustomerEntity(any(CustomerSignupRequest.class))).thenReturn(customerUser);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(customerUser);
        when(authMapper.toUserResponse(any(User.class))).thenReturn(userResponse);

        UserResponse result = authService.registerCustomer(customerRequest);

        assertNotNull(result);
        assertEquals("alice@example.com", result.getEmail());
        verify(emailVerificationTokenRepository).save(any(EmailVerificationToken.class));
        verify(emailService).sendVerificationEmail(eq("alice@example.com"), anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw BadRequestException when customer password and confirmPassword mismatch")
    void testRegisterCustomerPasswordMismatch() {
        customerRequest.setConfirmPassword("DifferentPassword@123");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.registerCustomer(customerRequest));
        assertTrue(ex.getMessage().contains("Password and confirm password do not match"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when customer email already exists")
    void testRegisterCustomerDuplicateEmail() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> authService.registerCustomer(customerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when customer phone number already exists")
    void testRegisterCustomerDuplicatePhone() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("9876543210")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> authService.registerCustomer(customerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should register owner with license details when willing to drive")
    void testRegisterOwnerWillingToDrive() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(anyString())).thenReturn(false);
        when(authMapper.toOwnerEntity(any(OwnerSignupRequest.class))).thenReturn(ownerUser);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(ownerUser);
        when(authMapper.toUserResponse(any(User.class))).thenReturn(
                UserResponse.builder()
                        .id(2L)
                        .firstName("Bob")
                        .lastName("Builder")
                        .email("bob@example.com")
                        .role(Role.ROLE_OWNER)
                        .build()
        );

        UserResponse result = authService.registerOwner(ownerRequest);

        assertNotNull(result);
        assertEquals("bob@example.com", result.getEmail());
        assertEquals(Role.ROLE_OWNER, result.getRole());
        verify(userRepository).save(argThat(u -> Boolean.TRUE.equals(u.getWillingToDrive()) && "DL-12345678".equals(u.getDrivingLicenseNumber())));
    }

    @Test
    @DisplayName("Should throw BadRequestException when owner password and confirmPassword mismatch")
    void testRegisterOwnerPasswordMismatch() {
        ownerRequest.setConfirmPassword("DifferentPassword@123");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.registerOwner(ownerRequest));
        assertTrue(ex.getMessage().contains("Password and confirm password do not match"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should verify email successfully with correct OTP")
    void testVerifyEmailSuccess() {
        EmailVerificationToken token = EmailVerificationToken.builder()
                .user(customerUser)
                .token("123456")
                .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                .build();

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(customerUser));
        when(emailVerificationTokenRepository.findByUser(customerUser)).thenReturn(Optional.of(token));

        VerifyEmailRequest request = new VerifyEmailRequest("alice@example.com", "123456", null);
        authService.verifyEmail(request);

        assertTrue(customerUser.isEmailVerified());
        verify(userRepository).save(customerUser);
        verify(emailVerificationTokenRepository).delete(token);
    }

    @Test
    @DisplayName("Should reject incorrect OTP")
    void testVerifyEmailIncorrectOtp() {
        EmailVerificationToken token = EmailVerificationToken.builder()
                .user(customerUser)
                .token("123456")
                .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                .build();

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(customerUser));
        when(emailVerificationTokenRepository.findByUser(customerUser)).thenReturn(Optional.of(token));

        VerifyEmailRequest request = new VerifyEmailRequest("alice@example.com", "654321", null);
        InvalidTokenException ex = assertThrows(InvalidTokenException.class, () -> authService.verifyEmail(request));
        assertTrue(ex.getMessage().contains("Invalid OTP"));
    }

    @Test
    @DisplayName("Should reject expired OTP")
    void testVerifyEmailExpiredOtp() {
        EmailVerificationToken token = EmailVerificationToken.builder()
                .user(customerUser)
                .token("123456")
                .expiryDate(Instant.now().minus(5, ChronoUnit.MINUTES))
                .build();

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(customerUser));
        when(emailVerificationTokenRepository.findByUser(customerUser)).thenReturn(Optional.of(token));

        VerifyEmailRequest request = new VerifyEmailRequest("alice@example.com", "123456", null);
        InvalidTokenException ex = assertThrows(InvalidTokenException.class, () -> authService.verifyEmail(request));
        assertTrue(ex.getMessage().contains("expired"));
        verify(emailVerificationTokenRepository).delete(token);
    }

    @Test
    @DisplayName("Should resend verification OTP and invalidate previous one")
    void testResendVerificationOtp() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(customerUser));

        authService.resendVerificationOtp("alice@example.com");

        verify(emailVerificationTokenRepository).deleteByUser(customerUser);
        verify(emailVerificationTokenRepository).save(any(EmailVerificationToken.class));
        verify(emailService).sendVerificationEmail(eq("alice@example.com"), anyString(), anyString());
    }

    @Test
    @DisplayName("Should reject login when email is unverified")
    void testLoginUnverifiedUserThrowsDisabledException() {
        LoginRequest loginRequest = new LoginRequest("alice@example.com", "Password@123");
        customerUser.setEmailVerified(false);
        UserDetailsImpl userDetails = UserDetailsImpl.build(customerUser);
        Authentication authentication = mock(Authentication.class);

        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(userRepository.findById(1L)).thenReturn(Optional.of(customerUser));

        assertThrows(DisabledException.class, () -> authService.login(loginRequest));
    }

    @Test
    @DisplayName("Should login verified user successfully and return tokens")
    void testLoginVerifiedUserSuccess() {
        LoginRequest loginRequest = new LoginRequest("alice@example.com", "Password@123");
        customerUser.setEmailVerified(true);
        UserDetailsImpl userDetails = UserDetailsImpl.build(customerUser);
        Authentication authentication = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findById(1L)).thenReturn(Optional.of(customerUser));
        when(jwtTokenProvider.generateAccessToken(userDetails)).thenReturn("dummy-access-token");
        when(jwtTokenProvider.getAccessTokenExpirationMs()).thenReturn(3600000L);
        when(refreshTokenService.createRefreshToken(customerUser)).thenReturn(
                RefreshToken.builder().token("dummy-refresh-token").build()
        );
        when(authMapper.toUserResponse(customerUser)).thenReturn(userResponse);

        AuthResponse authResponse = authService.login(loginRequest);

        assertNotNull(authResponse);
        assertEquals("dummy-access-token", authResponse.getAccessToken());
        assertEquals("dummy-refresh-token", authResponse.getRefreshToken());
        assertEquals("Bearer", authResponse.getTokenType());
    }

    @Test
    @DisplayName("Should login successfully after email_verified is set to true in database")
    void testLoginAfterManualDatabaseEmailVerificationUpdate() {
        LoginRequest loginRequest = new LoginRequest("alice@example.com", "Password@123");
        // Simulate DB value changed from false to true
        customerUser.setEmailVerified(true);
        UserDetailsImpl userDetails = UserDetailsImpl.build(customerUser);
        Authentication authentication = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findById(1L)).thenReturn(Optional.of(customerUser));
        when(jwtTokenProvider.generateAccessToken(userDetails)).thenReturn("fresh-jwt-token");
        when(jwtTokenProvider.getAccessTokenExpirationMs()).thenReturn(3600000L);
        when(refreshTokenService.createRefreshToken(customerUser)).thenReturn(
                RefreshToken.builder().token("fresh-refresh-token").build()
        );
        when(authMapper.toUserResponse(customerUser)).thenReturn(userResponse);

        AuthResponse authResponse = authService.login(loginRequest);

        assertNotNull(authResponse);
        assertEquals("fresh-jwt-token", authResponse.getAccessToken());
        assertTrue(customerUser.isEmailVerified());
    }
}
