package com.carrental.owner.repository;

import com.carrental.owner.entity.OwnerDriverUsageHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OwnerDriverUsageHistoryRepository extends JpaRepository<OwnerDriverUsageHistory, Long> {
    List<OwnerDriverUsageHistory> findByOwnerId(Long ownerId);
    List<OwnerDriverUsageHistory> findByDriverId(Long driverId);
    List<OwnerDriverUsageHistory> findByOwnerIdAndDriverId(Long ownerId, Long driverId);
}

