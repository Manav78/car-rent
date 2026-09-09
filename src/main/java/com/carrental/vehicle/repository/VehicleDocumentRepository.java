package com.carrental.vehicle.repository;

import com.carrental.vehicle.entity.VehicleDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleDocumentRepository extends JpaRepository<VehicleDocument, Long> {
    List<VehicleDocument> findByVehicleId(Long vehicleId);
    List<VehicleDocument> findByVehicleIdAndDocumentType(Long vehicleId, String documentType);
}

