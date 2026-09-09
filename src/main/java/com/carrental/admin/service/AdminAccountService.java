package com.carrental.admin.service;

import com.carrental.admin.dto.response.DeletedAccountResponse;
import com.carrental.admin.dto.request.SoftDeleteRequest;
import com.carrental.security.service.UserDetailsImpl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminAccountService {
    Page<DeletedAccountResponse> getDeletedAccounts(String search, Pageable pageable);
    void softDeleteAccount(Long userId, SoftDeleteRequest request, UserDetailsImpl principal);
    void restoreAccount(Long userId);
    void permanentlyDeleteAccount(Long userId, UserDetailsImpl principal);
}

