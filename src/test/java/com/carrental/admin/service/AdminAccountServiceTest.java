package com.carrental.admin.service;

import com.carrental.admin.dto.response.DeletedAccountResponse;
import com.carrental.admin.dto.request.SoftDeleteRequest;
import com.carrental.admin.repository.AdminAccountRepository;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAccountServiceTest {

    @Mock
    private AdminAccountRepository adminAccountRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private com.carrental.admin.service.impl.AdminAccountServiceImpl adminAccountService;

    private User admin;
    private UserDetailsImpl adminPrincipal;
    private User regularUser;

    @BeforeEach
    void setUp() {
        admin = User.builder()
                .id(1L)
                .firstName("Admin")
                .lastName("User")
                .role(Role.ADMIN)
                .build();

        adminPrincipal = UserDetailsImpl.builder()
                .id(1L)
                .email("admin@test.com")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();

        regularUser = User.builder()
                .id(2L)
                .firstName("John")
                .lastName("Doe")
                .email("john@test.com")
                .role(Role.CUSTOMER)
                .enabled(true)
                .build();
    }

    @Test
    @DisplayName("getDeletedAccounts - returns mapped deleted accounts page")
    void testGetDeletedAccounts() {
        Pageable pageable = PageRequest.of(0, 10);
        regularUser.setDeletedAt(LocalDateTime.now());
        Page<User> userPage = new PageImpl<>(List.of(regularUser), pageable, 1);

        when(adminAccountRepository.findDeletedAccounts(null, pageable)).thenReturn(userPage);

        Page<DeletedAccountResponse> result = adminAccountService.getDeletedAccounts(null, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).userId()).isEqualTo(2L);
    }

    @Test
    @DisplayName("softDeleteAccount - success")
    void testSoftDeleteAccount_Success() {
        SoftDeleteRequest request = new SoftDeleteRequest("Policy violation");
        when(userRepository.findByIdWithDeletedBy(2L)).thenReturn(Optional.of(regularUser));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        adminAccountService.softDeleteAccount(2L, request, adminPrincipal);

        assertThat(regularUser.getDeletedAt()).isNotNull();
        assertThat(regularUser.isEnabled()).isFalse();
        assertThat(regularUser.getDeleteReason()).isEqualTo("Policy violation");
        assertThat(regularUser.getDeletedByUser()).isEqualTo(admin);
        verify(userRepository).save(regularUser);
    }

    @Test
    @DisplayName("softDeleteAccount - self delete throws FORBIDDEN")
    void testSoftDeleteAccount_SelfDelete() {
        SoftDeleteRequest request = new SoftDeleteRequest("Delete self");

        assertThatThrownBy(() -> adminAccountService.softDeleteAccount(1L, request, adminPrincipal))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    @DisplayName("softDeleteAccount - admin account throws FORBIDDEN")
    void testSoftDeleteAccount_AdminAccount() {
        User anotherAdmin = User.builder().id(3L).role(Role.ADMIN).build();
        when(userRepository.findByIdWithDeletedBy(3L)).thenReturn(Optional.of(anotherAdmin));

        assertThatThrownBy(() -> adminAccountService.softDeleteAccount(3L, null, adminPrincipal))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    @DisplayName("softDeleteAccount - already deleted throws CONFLICT")
    void testSoftDeleteAccount_AlreadyDeleted() {
        regularUser.setDeletedAt(LocalDateTime.now());
        when(userRepository.findByIdWithDeletedBy(2L)).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> adminAccountService.softDeleteAccount(2L, null, adminPrincipal))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    @DisplayName("restoreAccount - success")
    void testRestoreAccount_Success() {
        regularUser.setDeletedAt(LocalDateTime.now());
        regularUser.setEnabled(false);
        when(userRepository.findByIdWithDeletedBy(2L)).thenReturn(Optional.of(regularUser));

        adminAccountService.restoreAccount(2L);

        assertThat(regularUser.getDeletedAt()).isNull();
        assertThat(regularUser.isEnabled()).isTrue();
        verify(userRepository).save(regularUser);
    }

    @Test
    @DisplayName("restoreAccount - not deleted throws CONFLICT")
    void testRestoreAccount_NotDeleted() {
        regularUser.setDeletedAt(null);
        when(userRepository.findByIdWithDeletedBy(2L)).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> adminAccountService.restoreAccount(2L))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    @DisplayName("permanentlyDeleteAccount - success")
    void testPermanentlyDeleteAccount_Success() {
        regularUser.setDeletedAt(LocalDateTime.now());
        when(userRepository.findByIdWithDeletedBy(2L)).thenReturn(Optional.of(regularUser));

        adminAccountService.permanentlyDeleteAccount(2L, adminPrincipal);

        verify(userRepository).delete(regularUser);
    }

    @Test
    @DisplayName("permanentlyDeleteAccount - not soft deleted throws CONFLICT")
    void testPermanentlyDeleteAccount_NotSoftDeleted() {
        regularUser.setDeletedAt(null);
        when(userRepository.findByIdWithDeletedBy(2L)).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> adminAccountService.permanentlyDeleteAccount(2L, adminPrincipal))
                .isInstanceOf(ResponseStatusException.class);
    }
}

