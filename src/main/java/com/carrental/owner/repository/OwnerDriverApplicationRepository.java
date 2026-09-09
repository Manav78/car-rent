package com.carrental.owner.repository;

import com.carrental.owner.entity.OwnerDriverApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OwnerDriverApplicationRepository extends JpaRepository<OwnerDriverApplication, Long> {
    List<OwnerDriverApplication> findByOwnerId(Long ownerId);
    List<OwnerDriverApplication> findByStatus(String status);
}

