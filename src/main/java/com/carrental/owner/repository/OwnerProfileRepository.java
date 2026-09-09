package com.carrental.owner.repository;

import com.carrental.owner.entity.OwnerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerProfileRepository extends JpaRepository<OwnerProfile, Long> {
    Optional<OwnerProfile> findByUserId(Long userId);

    @Query(value = "SELECT op FROM OwnerProfile op JOIN FETCH op.user",
           countQuery = "SELECT count(op) FROM OwnerProfile op")
    Page<OwnerProfile> findAllWithUser(Pageable pageable);
}

