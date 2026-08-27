package com.carrental.customer.service;

import com.carrental.customer.dto.CustomerResponse;
import com.carrental.customer.dto.CustomerUpdateRequest;

public interface CustomerService {

    CustomerResponse getCustomerProfile(Long userId);

    CustomerResponse updateCustomerProfile(Long userId, CustomerUpdateRequest request);
}
