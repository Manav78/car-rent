package com.carrental.auth.service;

import com.carrental.auth.dto.request.CustomerSignupRequest;
import com.carrental.auth.dto.request.LoginRequest;
import com.carrental.auth.dto.request.OwnerSignupRequest;
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
import com.carrental.auth.security.JwtTokenProvider;
import com.carrental.auth.security.UserDetailsImpl;
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
                .password("password123")
                .phoneNumber("1234567890")
                .build();

        ownerRequest = OwnerSignupRequest.builder()
                .firstName("Bob")
                .lastName("Builder")
                .email("bob@example.com")
                .password("password123")
                .phoneNumber("0987654321")
                .willingToDrive(true)
                .drivingLicenseNumber("DL-12345678")
                .licenseExpiryDate(LocalDate.now().plusYears(2))
                .build();

        customerUser = User.builder()
                .id(1L)
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@example.com")
                .role(Role.ROLE_CUSTOMER)
                .build();

        ownerUser = User.builder()
                .id(2L)
                .firstName("Bob")
                .lastName("Builder")
                .email("bob@example.com")
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
    @DisplayName("Should register customer successfully")
    void testRegisterCustomerSuccess() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
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
    @DisplayName("Should throw exception when customer email already exists")
    void testRegisterCustomerDuplicateEmail() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> authService.registerCustomer(customerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should register owner with license details when willing to drive")
    void testRegisterOwnerWillingToDrive() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
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
                        .willingToDrive(true)
                        .drivingLicenseNumber("DL-12345678")
                        .build()
        );

        UserResponse result = authService.registerOwner(ownerRequest);

        assertNotNull(result);
        assertEquals("bob@example.com", result.getEmail());
        assertEquals(Role.ROLE_OWNER, result.getRole());
        assertTrue(result.getWillingToDrive());
        assertEquals("DL-12345678", result.getDrivingLicenseNumber());
    }

    @Test
    @DisplayName("Should login successfully and return access & refresh tokens")
    void testLoginSuccess() {
        LoginRequest loginRequest = new LoginRequest("alice@example.com", "password123");
        UserDetailsImpl userDetails = UserDetailsImpl.build(customerUser);
        Authentication authentication = mock(Authentication.class);

        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
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
}
