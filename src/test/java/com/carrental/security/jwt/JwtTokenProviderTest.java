package com.carrental.security.jwt;

import com.carrental.security.service.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

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
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(100L)
                .email("user@example.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .build();

        String token = jwtTokenProvider.generateAccessToken(userDetails);

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
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(101L)
                .email("expired@example.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .build();

        String token = jwtTokenProvider.generateAccessToken(userDetails);

        assertFalse(jwtTokenProvider.validateToken(token));
        assertTrue(jwtTokenProvider.isTokenExpired(token));
    }

    @Test
    @DisplayName("Should generate minimal token for multi-role UserDetailsImpl")
    void testGenerateAccessToken_UserDetailsImpl_MultiRole() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(11L)
                .email("amit.shinde@test.com")
                .firstName("Amit")
                .lastName("Shinde")
                .authorities(List.of(
                        new SimpleGrantedAuthority("ROLE_OWNER"),
                        new SimpleGrantedAuthority("ROLE_DRIVER")
                ))
                .build();

        String token = jwtTokenProvider.generateAccessToken(userDetails);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("amit.shinde@test.com", jwtTokenProvider.extractUsername(token));
        assertEquals(11L, jwtTokenProvider.extractUserId(token));

        io.jsonwebtoken.Claims claims = jwtTokenProvider.extractAllClaims(token);
        assertNull(claims.get("email"), "email claim should not be duplicated when sub is present");
        assertNull(claims.get("firstName"), "firstName claim should be omitted for minimal payload");
        assertNull(claims.get("lastName"), "lastName claim should be omitted for minimal payload");

        List<String> roles = jwtTokenProvider.extractRoles(token);
        assertEquals(List.of("OWNER", "DRIVER"), roles);
    }
}

