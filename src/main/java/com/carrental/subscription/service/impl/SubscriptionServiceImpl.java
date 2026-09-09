package com.carrental.subscription.service.impl;

import com.carrental.auth.entity.User;
import com.carrental.auth.repository.UserRepository;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.subscription.entity.OwnerSubscription;
import com.carrental.subscription.entity.SubscriptionPlan;
import com.carrental.subscription.repository.OwnerSubscriptionRepository;
import com.carrental.subscription.repository.SubscriptionPlanRepository;
import com.carrental.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final OwnerSubscriptionRepository ownerSubscriptionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlan> getActivePlans() {
        return subscriptionPlanRepository.findByIsActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionPlan getPlanById(Long id) {
        return subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OwnerSubscription> getOwnerSubscriptions(Long ownerId) {
        return ownerSubscriptionRepository.findByOwnerId(ownerId);
    }

    @Override
    @Transactional
    public OwnerSubscription subscribe(Long ownerId, Long planId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));

        SubscriptionPlan plan = getPlanById(planId);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endAt = now.plusDays(plan.getDurationDays() != null ? plan.getDurationDays() : 30);

        OwnerSubscription subscription = OwnerSubscription.builder()
                .owner(owner)
                .plan(plan)
                .startAt(now)
                .endAt(endAt)
                .status("ACTIVE")
                .build();

        OwnerSubscription saved = ownerSubscriptionRepository.save(subscription);
        log.info("Created subscription id {} for owner {}", saved.getId(), ownerId);
        return saved;
    }

    @Override
    @Transactional
    public OwnerSubscription cancelSubscription(Long subscriptionId) {
        OwnerSubscription subscription = ownerSubscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + subscriptionId));

        subscription.setStatus("CANCELLED");
        OwnerSubscription saved = ownerSubscriptionRepository.save(subscription);
        log.info("Cancelled subscription id {}", subscriptionId);
        return saved;
    }
}
