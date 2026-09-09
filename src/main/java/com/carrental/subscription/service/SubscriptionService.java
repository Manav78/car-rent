package com.carrental.subscription.service;

import com.carrental.subscription.entity.OwnerSubscription;
import com.carrental.subscription.entity.SubscriptionPlan;

import java.util.List;

public interface SubscriptionService {
    List<SubscriptionPlan> getActivePlans();
    SubscriptionPlan getPlanById(Long id);
    List<OwnerSubscription> getOwnerSubscriptions(Long ownerId);
    OwnerSubscription subscribe(Long ownerId, Long planId);
    OwnerSubscription cancelSubscription(Long subscriptionId);
}
