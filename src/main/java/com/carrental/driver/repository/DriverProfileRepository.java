package com.carrental.driver.repository;

import com.carrental.driver.entity.DriverProfile;
import com.carrental.driver.enums.DriverStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverProfileRepository extends JpaRepository<DriverProfile, Long> {
    Optional<DriverProfile> findByUserId(Long userId);
    List<DriverProfile> findByStatus(DriverStatus status);
    Optional<DriverProfile> findByLicenseNumber(String licenseNumber);
    List<DriverProfile> findByAddedByOwnerId(Long ownerId);

    @Query(value = "SELECT dp FROM DriverProfile dp JOIN FETCH dp.user",
           countQuery = "SELECT count(dp) FROM DriverProfile dp")
    Page<DriverProfile> findAllWithDetails(Pageable pageable);

    @Query(value = "SELECT dp FROM DriverProfile dp JOIN FETCH dp.user u WHERE dp.status = :status AND com.carrental.auth.enums.Role.DRIVER MEMBER OF u.roles",
           countQuery = "SELECT count(dp) FROM DriverProfile dp JOIN dp.user u WHERE dp.status = :status AND com.carrental.auth.enums.Role.DRIVER MEMBER OF u.roles")
    Page<DriverProfile> findAllByStatusWithDetails(@Param("status") DriverStatus status, Pageable pageable);

    @Query("SELECT dp FROM DriverProfile dp JOIN FETCH dp.user WHERE dp.id = :id")
    Optional<DriverProfile> findByIdWithDetails(@Param("id") Long id);

    @Query(value = "SELECT dp FROM DriverProfile dp JOIN FETCH dp.user u WHERE dp.status = :status AND com.carrental.auth.enums.Role.OWNER MEMBER OF u.roles",
           countQuery = "SELECT count(dp) FROM DriverProfile dp JOIN dp.user u WHERE dp.status = :status AND com.carrental.auth.enums.Role.OWNER MEMBER OF u.roles")
    Page<DriverProfile> findPendingOwnerDrivers(@Param("status") DriverStatus status, Pageable pageable);

    @Query("SELECT dp FROM DriverProfile dp JOIN FETCH dp.user u WHERE dp.id = :id AND com.carrental.auth.enums.Role.OWNER MEMBER OF u.roles")
    Optional<DriverProfile> findOwnerDriverById(@Param("id") Long id);

    long countByStatus(DriverStatus status);

    @Query("SELECT count(dp) FROM DriverProfile dp JOIN dp.user u WHERE dp.status = :status AND com.carrental.auth.enums.Role.DRIVER MEMBER OF u.roles")
    long countPendingDrivers(@Param("status") DriverStatus status);

    @Query("SELECT count(dp) FROM DriverProfile dp JOIN dp.user u WHERE dp.status = :status AND com.carrental.auth.enums.Role.OWNER MEMBER OF u.roles")
    long countPendingOwnerDrivers(@Param("status") DriverStatus status);
}

