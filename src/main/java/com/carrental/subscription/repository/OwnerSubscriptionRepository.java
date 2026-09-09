package com.carrental.subscription.repository;

import com.carrental.subscription.entity.OwnerSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OwnerSubscriptionRepository extends JpaRepository<OwnerSubscription, Long> {
    List<OwnerSubscription> findByOwnerId(Long ownerId);
    List<OwnerSubscription> findByOwnerIdAndStatus(Long ownerId, String status);
}

