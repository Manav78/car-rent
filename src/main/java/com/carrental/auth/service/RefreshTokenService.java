package com.carrental.auth.service;

import com.carrental.auth.entity.RefreshToken;
import com.carrental.auth.entity.User;

import java.util.Optional;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(User user);

    RefreshToken verifyExpiration(RefreshToken token);

    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(User user);

    void revokeToken(RefreshToken token);
}

