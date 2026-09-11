package com.carrental.admin.service.impl;

import com.carrental.admin.service.AdminAccountService;
import com.carrental.admin.dto.response.DeletedAccountResponse;
import com.carrental.admin.dto.request.SoftDeleteRequest;
import com.carrental.admin.repository.AdminAccountRepository;
import com.carrental.auth.entity.User;
import com.carrental.auth.enums.Role;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.BadRequestException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.security.service.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAccountServiceImpl implements AdminAccountService {

    private final AdminAccountRepository adminAccountRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<DeletedAccountResponse> getDeletedAccounts(String search, Pageable pageable) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();

        return adminAccountRepository
                .findDeletedAccounts(normalizedSearch, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public void softDeleteAccount(Long userId, SoftDeleteRequest request, UserDetailsImpl principal) {
        if (userId.equals(principal.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Admin cannot delete their own account"
            );
        }

        User user = findUser(userId);
        assertNotAdmin(user);

        if (user.getDeletedAt() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Account is already deleted"
            );
        }

        User admin = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Admin user not found"
                ));

        user.setDeletedAt(LocalDateTime.now());
        user.setDeletedByUser(admin);
        user.setDeleteReason(request != null && request.reason() != null ? request.reason().trim() : null);
        user.setIsActive(false);

        userRepository.save(user);
    }

    @Transactional
    public void restoreAccount(Long userId) {
        User user = findUser(userId);

        if (user.getDeletedAt() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Account is not deleted. Cannot restore."
            );
        }

        user.setDeletedAt(null);
        user.setDeletedByUser(null);
        user.setDeleteReason(null);
        user.setIsActive(true);

        userRepository.save(user);
    }

    @Transactional
    public void permanentlyDeleteAccount(Long userId, UserDetailsImpl principal) {
        if (userId.equals(principal.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Admin cannot permanently delete their own account"
            );
        }

        User user = findUser(userId);
        assertNotAdmin(user);

        if (user.getDeletedAt() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only soft-deleted accounts can be permanently deleted. Soft delete the account first."
            );
        }

        userRepository.delete(user);
    }

    private User findUser(Long userId) {
        return userRepository.findByIdWithDeletedBy(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User account not found"
                ));
    }

    private void assertNotAdmin(User user) {
        boolean isAdmin = (user.getRoles() != null && user.getRoles().contains(Role.ADMIN))
                || user.getRole() == Role.ADMIN;
        if (isAdmin) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Admin accounts cannot be deleted"
            );
        }
    }

    private DeletedAccountResponse toResponse(User user) {
        List<String> roles = user.getRoles() != null && !user.getRoles().isEmpty()
                ? user.getRoles().stream().map(Enum::name).toList()
                : (user.getRole() != null ? List.of(user.getRole().name()) : List.of());

        return new DeletedAccountResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                "SELF",
                roles,
                user.getDeleteReason(),
                user.getDeletedByUser() != null ? user.getDeletedByUser().getFullName() : null,
                user.getDeletedAt(),
                user.getCreatedAt()
        );
    }
}

