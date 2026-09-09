package com.carrental.owner.service;

import com.carrental.owner.dto.response.OwnerResponse;
import com.carrental.owner.dto.request.OwnerUpdateRequest;

public interface OwnerService {

    OwnerResponse getOwnerProfile(Long userId);

    OwnerResponse updateOwnerProfile(Long userId, OwnerUpdateRequest request);
}

