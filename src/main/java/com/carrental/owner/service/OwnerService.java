package com.carrental.owner.service;

import com.carrental.owner.dto.OwnerResponse;
import com.carrental.owner.dto.OwnerUpdateRequest;

public interface OwnerService {

    OwnerResponse getOwnerProfile(Long userId);

    OwnerResponse updateOwnerProfile(Long userId, OwnerUpdateRequest request);
}
