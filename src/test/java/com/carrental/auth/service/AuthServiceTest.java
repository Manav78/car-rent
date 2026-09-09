package com.carrental.auth.service;

import com.carrental.auth.service.impl.AuthServiceImpl;

import com.carrental.auth.dto.request.LoginRequest;
import com.carrental.auth.dto.request.VerifyEmailRequest;
import com.carrental.auth.dto.response.AuthResponse;
import com.carrental.auth.dto.response.UserResponse;
import com.carrental.auth.entity.EmailVerificationToken;
import com.carrental.auth.entity.RefreshToken;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.exception.InvalidTokenException;
import com.carrental.auth.exception.UserAlreadyExistsException;
import com.carrental.auth.mapper.AuthMapper;
import com.carrental.auth.repository.EmailVerificationTokenRepository;
import com.carrental.auth.repository.PasswordResetTokenRepository;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.BadRequestException;
import com.carrental.customer.dto.request.CustomerSignupRequest;
import com.carrental.owner.dto.request.OwnerSignupRequest;
import com.carrental.driver.repository.DriverProfileRepository;
import com.carrental.notification.service.EmailService;
import com.carrental.owner.repository.OwnerProfileRepository;
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

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private OwnerProfileRepository ownerProfileRepository;

    @Mock
    private DriverProfileRepository driverProfileRepository;

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

    private User sampleUser;
    private UserResponse sampleUserResponse;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@example.com")
                .password("encoded_pass")
                .phoneNumber("9876543210")
                .role(Role.CUSTOMER)
                .emailVerified(true)
                .isActive(true)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        sampleUserResponse = UserResponse.builder()
                .id(1L)
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@example.com")
                .phoneNumber("9876543210")
                .role(Role.CUSTOMER)
                .emailVerified(true)
                .isActive(true)
                .enabled(true)
                .build();
    }

    @Test
    @DisplayName("Should register customer successfully")
    void testRegisterCustomerSuccess() {
        CustomerSignupRequest request = new CustomerSignupRequest();
        request.setFirstName("Alice");
        request.setLastName("Smith");
        request.setEmail("alice@example.com");
        request.setPassword("Password@123");
        request.setConfirmPassword("Password@123");
        request.setPhoneNumber("9876543210");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(authMapper.toCustomerEntity(any(CustomerSignupRequest.class))).thenReturn(sampleUser);
        when(passwordEncoder.encode("Password@123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(authMapper.toUserResponse(any(User.class))).thenReturn(sampleUserResponse);

        UserResponse response = authService.registerCustomer(request);

        assertNotNull(response);
        assertEquals("alice@example.com", response.getEmail());
        verify(emailService).sendVerificationEmail(eq("alice@example.com"), anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw exception when passwords do not match")
    void testRegisterPasswordMismatch() {
        CustomerSignupRequest request = new CustomerSignupRequest();
        request.setPassword("Pass1");
        request.setConfirmPassword("Pass2");

        assertThrows(BadRequestException.class, () -> authService.registerCustomer(request));
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void testRegisterDuplicateEmail() {
        CustomerSignupRequest request = new CustomerSignupRequest();
        request.setEmail("alice@example.com");
        request.setPassword("Password@123");
        request.setConfirmPassword("Password@123");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> authService.registerCustomer(request));
    }

    @Test
    @DisplayName("Should login successfully")
    void testLoginSuccess() {
        LoginRequest loginRequest = new LoginRequest("alice@example.com", "Password@123");
        Authentication authentication = mock(Authentication.class);
        RefreshToken refreshToken = RefreshToken.builder().token("mock-refresh-token").build();
        UserDetailsImpl userDetails = UserDetailsImpl.builder().id(1L).email("alice@example.com").build();

        sampleUser.setEmailVerified(true);
        sampleUser.setIsActive(true);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(jwtTokenProvider.generateAccessToken(userDetails)).thenReturn("mock-access-token");
        when(refreshTokenService.createRefreshToken(sampleUser)).thenReturn(refreshToken);
        when(authMapper.toUserResponse(sampleUser)).thenReturn(sampleUserResponse);

        AuthResponse authResponse = authService.login(loginRequest);

        assertNotNull(authResponse);
        assertEquals("mock-access-token", authResponse.getAccessToken());
        assertEquals("mock-refresh-token", authResponse.getRefreshToken());
    }

    @Test
    @DisplayName("Should login admin successfully")
    void testLoginSuccess_Admin() {
        LoginRequest loginRequest = new LoginRequest("admin@carrental.com", "Admin@123");
        Authentication authentication = mock(Authentication.class);
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L)
                .email("admin@carrental.com")
                .authorities(java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();
        User adminUser = User.builder()
                .id(1L)
                .name("Super Admin")
                .email("admin@carrental.com")
                .isActive(true)
                .emailVerified(true)
                .role(Role.ADMIN)
                .build();
        UserResponse adminResponse = UserResponse.builder()
                .id(1L)
                .firstName("Super Admin")
                .email("admin@carrental.com")
                .role(Role.ADMIN)
                .emailVerified(true)
                .isActive(true)
                .enabled(true)
                .build();
        RefreshToken refreshToken = RefreshToken.builder().token("admin-refresh-token").build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(jwtTokenProvider.generateAccessToken(userDetails)).thenReturn("admin-access-token");
        when(refreshTokenService.createRefreshToken(adminUser)).thenReturn(refreshToken);
        when(authMapper.toUserResponse(adminUser)).thenReturn(adminResponse);

        AuthResponse authResponse = authService.login(loginRequest);

        assertNotNull(authResponse);
        assertEquals("admin-access-token", authResponse.getAccessToken());
        assertEquals(Role.ADMIN, authResponse.getUser().getRole());
    }

    @Test
    @DisplayName("Should login admin successfully via adminLogin endpoint")
    void testAdminLoginSuccess() {
        LoginRequest loginRequest = new LoginRequest("admin@carrental.com", "Admin@123");
        Authentication authentication = mock(Authentication.class);
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L)
                .email("admin@carrental.com")
                .authorities(java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();
        User adminUser = User.builder()
                .id(1L)
                .name("Super Admin")
                .email("admin@carrental.com")
                .isActive(true)
                .emailVerified(true)
                .role(Role.ADMIN)
                .build();
        UserResponse adminResponse = UserResponse.builder()
                .id(1L)
                .firstName("Super Admin")
                .email("admin@carrental.com")
                .role(Role.ADMIN)
                .emailVerified(true)
                .isActive(true)
                .enabled(true)
                .build();
        RefreshToken refreshToken = RefreshToken.builder().token("admin-refresh-token").build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(jwtTokenProvider.generateAccessToken(userDetails)).thenReturn("admin-access-token");
        when(refreshTokenService.createRefreshToken(adminUser)).thenReturn(refreshToken);
        when(authMapper.toUserResponse(adminUser)).thenReturn(adminResponse);

        AuthResponse authResponse = authService.adminLogin(loginRequest);

        assertNotNull(authResponse);
        assertEquals("admin-access-token", authResponse.getAccessToken());
        assertEquals(Role.ADMIN, authResponse.getUser().getRole());
    }

    @Test
    @DisplayName("Should verify email successfully")
    void testVerifyEmailSuccess() {
        sampleUser.setEmailVerified(false);
        EmailVerificationToken token = EmailVerificationToken.builder()
                .id(1L)
                .user(sampleUser)
                .token("123456")
                .expiryDate(Instant.now().plusSeconds(300))
                .build();

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(emailVerificationTokenRepository.findByUser(sampleUser)).thenReturn(Optional.of(token));

        authService.verifyEmail(new VerifyEmailRequest("alice@example.com", "123456"));

        assertTrue(sampleUser.isEmailVerified());
        verify(userRepository).save(sampleUser);
        verify(emailVerificationTokenRepository).delete(token);
    }

    @Test
    @DisplayName("Should throw exception when verification token expired")
    void testVerifyEmailExpiredToken() {
        sampleUser.setEmailVerified(false);
        EmailVerificationToken token = EmailVerificationToken.builder()
                .id(1L)
                .user(sampleUser)
                .token("123456")
                .expiryDate(Instant.now().minusSeconds(100))
                .build();

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(emailVerificationTokenRepository.findByUser(sampleUser)).thenReturn(Optional.of(token));

        assertThrows(InvalidTokenException.class, () ->
                authService.verifyEmail(new VerifyEmailRequest("alice@example.com", "123456"))
        );
    }

    @Test
    @DisplayName("Should throw DisabledException when logging in with unverified email")
    void testLoginUnverifiedEmail() {
        LoginRequest loginRequest = new LoginRequest("alice@example.com", "Password@123");
        Authentication authentication = mock(Authentication.class);
        UserDetailsImpl userDetails = UserDetailsImpl.builder().id(1L).email("alice@example.com").build();

        sampleUser.setEmailVerified(false);
        sampleUser.setIsActive(true);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        org.springframework.security.authentication.DisabledException ex =
                assertThrows(org.springframework.security.authentication.DisabledException.class,
                        () -> authService.login(loginRequest));
        assertTrue(ex.getMessage().contains("Account is disabled. Please verify your email first."));
    }

    @Test
    @DisplayName("Should register customer with emailVerified false and Role CUSTOMER")
    void testRegisterCustomerWithCorrectFlags() {
        CustomerSignupRequest request = new CustomerSignupRequest();
        request.setFirstName("Bob");
        request.setLastName("Ross");
        request.setEmail("bob@example.com");
        request.setPassword("Password@123");
        request.setConfirmPassword("Password@123");
        request.setPhoneNumber("9876543299");

        User freshUser = new User();
        when(userRepository.existsByEmail("bob@example.com")).thenReturn(false);
        when(authMapper.toCustomerEntity(any(CustomerSignupRequest.class))).thenReturn(freshUser);
        when(passwordEncoder.encode("Password@123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(authMapper.toUserResponse(any(User.class))).thenReturn(sampleUserResponse);

        authService.registerCustomer(request);

        assertFalse(freshUser.isEmailVerified());
        assertTrue(freshUser.isEnabled());
        assertEquals(Role.CUSTOMER, freshUser.getRole());
    }

    @Test
    @DisplayName("Should register owner with emailVerified false and Role OWNER")
    void testRegisterOwnerWithCorrectFlags() {
        OwnerSignupRequest request = new OwnerSignupRequest();
        request.setFirstName("Oscar");
        request.setLastName("Owner");
        request.setEmail("oscar@example.com");
        request.setPassword("Password@123");
        request.setConfirmPassword("Password@123");
        request.setPhoneNumber("9876543288");

        User freshUser = new User();
        when(userRepository.existsByEmail("oscar@example.com")).thenReturn(false);
        when(authMapper.toOwnerEntity(any(OwnerSignupRequest.class))).thenReturn(freshUser);
        when(passwordEncoder.encode("Password@123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(authMapper.toUserResponse(any(User.class))).thenReturn(sampleUserResponse);

        authService.registerOwner(request);

        assertFalse(freshUser.isEmailVerified());
        assertTrue(freshUser.isEnabled());
        assertEquals(Role.OWNER, freshUser.getRole());
    }
}

