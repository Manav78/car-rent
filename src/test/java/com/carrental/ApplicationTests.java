package com.carrental;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class ApplicationTests {

    @Test
    @DisplayName("Context Loads Successfully")
    void contextLoads() {
        assertTrue(true, "Spring application context loaded without errors");
    }
}

