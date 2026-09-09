package com.carrental.driver.repository;

import com.carrental.driver.entity.DriverDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriverDocumentRepository extends JpaRepository<DriverDocument, Long> {
    List<DriverDocument> findByDriverId(Long driverId);
    List<DriverDocument> findByDriverIdAndDocumentType(Long driverId, String documentType);
}

