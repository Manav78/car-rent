package com.carrental.admin.controller;

import com.carrental.admin.dto.response.DeletedAccountResponse;
import com.carrental.admin.dto.response.PageResponse;
import com.carrental.admin.dto.request.SoftDeleteRequest;
import com.carrental.admin.service.AdminAccountService;
import com.carrental.common.dto.ApiResponse;
import com.carrental.security.service.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAccountControllerTest {

    @Mock
    private AdminAccountService adminAccountService;

    @InjectMocks
    private AdminAccountController adminAccountController;

    private UserDetailsImpl principal;

    @BeforeEach
    void setUp() {
        principal = UserDetailsImpl.builder()
                .id(1L)
                .email("admin@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();
    }

    @Test
    @DisplayName("getDeletedAccounts - returns page")
    void testGetDeletedAccounts() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<DeletedAccountResponse> page = new PageImpl<>(Collections.emptyList(), pageable, 0);
        when(adminAccountService.getDeletedAccounts(eq("test"), eq(pageable))).thenReturn(page);

        ResponseEntity<ApiResponse<PageResponse<DeletedAccountResponse>>> result =
                adminAccountController.getDeletedAccounts("test", pageable);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("softDeleteAccount - success")
    void testSoftDeleteAccount() {
        SoftDeleteRequest request = new SoftDeleteRequest("Reason");

        ResponseEntity<ApiResponse<Void>> result = adminAccountController.softDeleteAccount(2L, request, principal);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(adminAccountService).softDeleteAccount(2L, request, principal);
    }

    @Test
    @DisplayName("restoreAccount - success")
    void testRestoreAccount() {
        ResponseEntity<ApiResponse<Void>> result = adminAccountController.restoreAccount(2L);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(adminAccountService).restoreAccount(2L);
    }

    @Test
    @DisplayName("permanentlyDeleteAccount - success")
    void testPermanentlyDeleteAccount() {
        ResponseEntity<ApiResponse<Void>> result = adminAccountController.permanentlyDeleteAccount(2L, principal);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(adminAccountService).permanentlyDeleteAccount(2L, principal);
    }
}

