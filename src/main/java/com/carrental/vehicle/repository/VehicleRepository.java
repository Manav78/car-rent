package com.carrental.vehicle.repository;

import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.enums.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByOwnerId(Long ownerId);

    List<Vehicle> findByStatus(VehicleStatus status);

    List<Vehicle> findByVehicleType(VehicleType vehicleType);

    boolean existsByLicensePlate(String licensePlate);

    long countByStatus(VehicleStatus status);

    @Query("SELECT v FROM Vehicle v WHERE v.status = com.carrental.vehicle.enums.VehicleStatus.AVAILABLE " +
           "AND (CAST(:city AS string) IS NULL OR CAST(:city AS string) = '' OR LOWER(v.location) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%'))) " +
           "AND (:vehicleType IS NULL OR v.vehicleType = :vehicleType) " +
           "AND (:seatingCapacity IS NULL OR v.seatingCapacity >= :seatingCapacity)")
    List<Vehicle> searchAvailableVehicles(@Param("city") String city,
                                         @Param("vehicleType") VehicleType vehicleType,
                                         @Param("seatingCapacity") Integer seatingCapacity);
}
