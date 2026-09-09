package com.carrental.customer.service;

import com.carrental.customer.dto.response.CustomerResponse;
import com.carrental.customer.dto.request.CustomerUpdateRequest;

public interface CustomerService {

    CustomerResponse getCustomerProfile(Long userId);

    CustomerResponse updateCustomerProfile(Long userId, CustomerUpdateRequest request);

    void deleteCustomerAccount(Long userId);
}

