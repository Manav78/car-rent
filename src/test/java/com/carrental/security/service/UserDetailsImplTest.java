package com.carrental.security.service;

import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("UserDetailsImpl Unit Tests")
class UserDetailsImplTest {

    @Test
    @DisplayName("build - converts multi-role user to exactly ONE ROLE_ authority per role")
    void testBuild_MultiRoleUser() {
        User user = User.builder()
                .id(11L)
                .email("amit.shinde@test.com")
                .firstName("Amit")
                .lastName("Shinde")
                .password("encoded_pass")
                .emailVerified(true)
                .isActive(true)
                .roles(Set.of(Role.OWNER, Role.DRIVER))
                .build();

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getId()).isEqualTo(11L);
        assertThat(userDetails.getUsername()).isEqualTo("amit.shinde@test.com");
        assertThat(userDetails.isEnabled()).isTrue();

        List<String> authorityNames = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        // Exactly two authorities: ROLE_OWNER and ROLE_DRIVER (no unprefixed duplicate)
        assertThat(authorityNames).containsExactlyInAnyOrder("ROLE_OWNER", "ROLE_DRIVER");
        assertThat(authorityNames).doesNotContain("OWNER", "DRIVER");
    }

    @Test
    @DisplayName("build - converts single role user to exactly ONE ROLE_ authority")
    void testBuild_SingleRoleUser() {
        User user = User.builder()
                .id(1L)
                .email("customer@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("encoded_pass")
                .emailVerified(true)
                .isActive(true)
                .role(Role.CUSTOMER)
                .build();

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        assertThat(userDetails).isNotNull();
        List<String> authorityNames = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        assertThat(authorityNames).containsExactly("ROLE_CUSTOMER");
        assertThat(authorityNames).doesNotContain("CUSTOMER");
    }

    @Test
    @DisplayName("build - disabled if email not verified or isActive is false")
    void testBuild_DisabledWhenNotVerifiedOrInactive() {
        User unverifiedUser = User.builder()
                .id(2L)
                .email("unverified@test.com")
                .emailVerified(false)
                .isActive(true)
                .role(Role.CUSTOMER)
                .build();
        assertThat(UserDetailsImpl.build(unverifiedUser).isEnabled()).isFalse();

        User inactiveUser = User.builder()
                .id(3L)
                .email("inactive@test.com")
                .emailVerified(true)
                .isActive(false)
                .role(Role.CUSTOMER)
                .build();
        assertThat(UserDetailsImpl.build(inactiveUser).isEnabled()).isFalse();
    }
}
