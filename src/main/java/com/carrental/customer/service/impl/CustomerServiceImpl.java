package com.carrental.customer.service.impl;

import com.carrental.customer.service.CustomerService;

import com.carrental.auth.entity.User;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.customer.dto.response.CustomerResponse;
import com.carrental.customer.dto.request.CustomerUpdateRequest;
import com.carrental.customer.entity.CustomerProfile;
import com.carrental.customer.repository.CustomerProfileRepository;
import com.carrental.customer.mapper.CustomerMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final CustomerMapper customerMapper;

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                .orElse(null);

        return customerMapper.toResponse(user, profile);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomerProfile(Long userId, CustomerUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName().trim());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }

        userRepository.save(user);

        CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                .orElseGet(() -> CustomerProfile.builder().user(user).build());

        if (request.getAddress() != null) profile.setAddress(request.getAddress().trim());
        if (request.getCity() != null) profile.setCity(request.getCity().trim());
        if (request.getPostalCode() != null) profile.setPostalCode(request.getPostalCode().trim());

        CustomerProfile savedProfile = customerProfileRepository.save(profile);
        log.info("Updated customer profile for user id: {}", userId);

        return customerMapper.toResponse(user, savedProfile);
    }

    @Override
    @Transactional
    public void deleteCustomerAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        customerProfileRepository.findByUserId(userId)
                .ifPresent(customerProfileRepository::delete);

        userRepository.delete(user);
        log.info("Customer deleted own account for user ID: {}", userId);
    }
}

