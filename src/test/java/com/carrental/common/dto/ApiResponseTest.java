package com.carrental.common.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("ApiResponse DTO Tests")
class ApiResponseTest {

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @Test
    @DisplayName("Should create successful response with default 200 OK")
    void testSuccessResponseDefaults() {
        ApiResponse<String> response = ApiResponse.ok("Hello World");

        assertTrue(response.isSuccess());
        assertEquals("Operation successful", response.getMessage());
        assertEquals(200, response.getStatusCode());
        assertEquals(200, response.getStatus());
        assertEquals("Hello World", response.getData());
        assertNotNull(response.getTimestamp());
    }

    @Test
    @DisplayName("Should create response with custom message and data")
    void testOkWithMessageAndData() {
        ApiResponse<Integer> response = ApiResponse.ok("Created count", 42);

        assertTrue(response.isSuccess());
        assertEquals("Created count", response.getMessage());
        assertEquals(200, response.getStatusCode());
        assertEquals(42, response.getData());
    }

    @Test
    @DisplayName("Should create 201 Created response")
    void testCreatedResponse() {
        ApiResponse<String> response = ApiResponse.created("Resource created", "Resource#1");

        assertTrue(response.isSuccess());
        assertEquals(201, response.getStatusCode());
        assertEquals("Resource created", response.getMessage());
        assertEquals("Resource#1", response.getData());
    }

    @Test
    @DisplayName("Should create error response")
    void testErrorResponse() {
        ApiResponse<Void> response = ApiResponse.error(404, "Not Found");

        assertFalse(response.isSuccess());
        assertEquals(404, response.getStatusCode());
        assertEquals(404, response.getStatus());
        assertEquals("Not Found", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    @DisplayName("Should support builder pattern")
    void testBuilderPattern() {
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .statusCode(200)
                .message("Built successfully")
                .data("DataPayload")
                .build();

        assertTrue(response.isSuccess());
        assertEquals("Built successfully", response.getMessage());
        assertEquals("DataPayload", response.getData());
    }

    @Test
    @DisplayName("Should serialize and deserialize JSON with statusCode and status aliases")
    void testJsonSerialization() throws Exception {
        ApiResponse<String> original = ApiResponse.ok("TestData");
        String json = objectMapper.writeValueAsString(original);

        assertTrue(json.contains("\"success\":true"));
        assertTrue(json.contains("\"statusCode\":200"));

        ApiResponse<?> deserialized = objectMapper.readValue(json, ApiResponse.class);
        assertNotNull(deserialized);
        assertTrue(deserialized.isSuccess());
        assertEquals(200, deserialized.getStatusCode());
        assertEquals(200, deserialized.getStatus());
    }
}

