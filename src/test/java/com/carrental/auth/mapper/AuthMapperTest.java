package com.carrental.auth.mapper;

import com.carrental.auth.dto.response.UserResponse;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("AuthMapper Unit Tests")
class AuthMapperTest {

    private final AuthMapper authMapper = Mappers.getMapper(AuthMapper.class);
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    @DisplayName("Should map single role to roles collection in UserResponse")
    void testToUserResponse_SingleRole() {
        User user = User.builder()
                .id(1L)
                .name("John Customer")
                .email("john@customer.com")
                .phoneNumber("9876543210")
                .roles(Set.of(Role.CUSTOMER))
                .emailVerified(true)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        UserResponse response = authMapper.toUserResponse(user);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("John", response.getFirstName());
        assertEquals("Customer", response.getLastName());
        assertEquals("john@customer.com", response.getEmail());
        assertNotNull(response.getRoles());
        assertEquals(1, response.getRoles().size());
        assertTrue(response.getRoles().contains(Role.CUSTOMER));
    }

    @Test
    @DisplayName("Should map multiple roles (OWNER and DRIVER) to roles collection in UserResponse")
    void testToUserResponse_MultipleRoles_OwnerAndDriver() throws Exception {
        User user = User.builder()
                .id(2L)
                .name("Alice OwnerDriver")
                .email("alice@ownerdriver.com")
                .phoneNumber("9876543211")
                .roles(Set.of(Role.OWNER, Role.DRIVER))
                .emailVerified(true)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        UserResponse response = authMapper.toUserResponse(user);

        assertNotNull(response);
        assertEquals(2L, response.getId());
        assertNotNull(response.getRoles());
        assertEquals(2, response.getRoles().size());
        assertTrue(response.getRoles().contains(Role.OWNER));
        assertTrue(response.getRoles().contains(Role.DRIVER));

        // Verify JSON serialization output
        String json = objectMapper.writeValueAsString(response);
        JsonNode node = objectMapper.readTree(json);

        assertTrue(node.has("roles"), "JSON should contain 'roles' field");
        assertTrue(node.get("roles").isArray(), "'roles' field should be a JSON array/collection");
        assertEquals(2, node.get("roles").size());
        assertFalse(node.has("role"), "JSON should not contain obsolete single 'role' field");
    }
}
