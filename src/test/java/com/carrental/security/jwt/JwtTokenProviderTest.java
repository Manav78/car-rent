package com.carrental.security.jwt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("JwtTokenProvider Tests")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private static final String TEST_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtTokenProvider, "accessTokenExpirationMs", 3600000L);
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshTokenExpirationMs", 604800000L);
    }

    @Test
    @DisplayName("Should generate valid token and extract claims")
    void testGenerateAndExtractClaims() {
        String token = jwtTokenProvider.generateAccessToken(100L, "user@example.com", "John", "Doe", "ROLE_CUSTOMER");

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("user@example.com", jwtTokenProvider.extractUsername(token));
        assertEquals(100L, jwtTokenProvider.extractUserId(token));
        assertFalse(jwtTokenProvider.isTokenExpired(token));
    }

    @Test
    @DisplayName("Should return false for invalid or corrupted token")
    void testInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.jwt.token"));
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken(null));
    }

    @Test
    @DisplayName("Should detect expired token")
    void testExpiredToken() {
        // Set expiration to negative value (already expired)
        ReflectionTestUtils.setField(jwtTokenProvider, "accessTokenExpirationMs", -1000L);
        String token = jwtTokenProvider.generateAccessToken(101L, "expired@example.com", "Jane", "Doe", "ROLE_CUSTOMER");

        assertFalse(jwtTokenProvider.validateToken(token));
        assertTrue(jwtTokenProvider.isTokenExpired(token));
    }
}

