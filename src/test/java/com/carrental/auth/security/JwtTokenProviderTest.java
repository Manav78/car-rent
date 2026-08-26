package com.carrental.auth.security;

import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtTokenProvider, "accessTokenExpirationMs", 3600000L);
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshTokenExpirationMs", 604800000L);
    }

    @Test
    @DisplayName("Should generate and validate valid JWT token")
    void testGenerateAndValidateToken() {
        User user = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .role(Role.ROLE_CUSTOMER)
                .build();

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        String token = jwtTokenProvider.generateAccessToken(userDetails);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("john.doe@example.com", jwtTokenProvider.extractUsername(token));
    }

    @Test
    @DisplayName("Should reject invalid or malformed token")
    void testInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.jwt.token"));
    }
}
