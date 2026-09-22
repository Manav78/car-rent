package com.carrental.vehicle.repository;

import com.carrental.admin.enums.ApprovalDecision;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.enums.VehicleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long>, JpaSpecificationExecutor<Vehicle> {

    List<Vehicle> findByOwnerId(Long ownerId);

    List<Vehicle> findByOwner_User_Id(Long userId);

    Page<Vehicle> findByOwner_User_Id(Long userId, Pageable pageable);

    List<Vehicle> findByStatus(VehicleStatus status);

    List<Vehicle> findByVehicleType(VehicleType vehicleType);

    @Query("SELECT COUNT(v) > 0 FROM Vehicle v WHERE v.vehicleNumber = :licensePlate")
    boolean existsByLicensePlate(@Param("licensePlate") String licensePlate);

    boolean existsByVehicleNumber(String vehicleNumber);

    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);

    long countByStatus(VehicleStatus status);

    long countByApprovalStatus(ApprovalDecision approvalStatus);

    @Query("SELECT v FROM Vehicle v WHERE v.status = com.carrental.vehicle.enums.VehicleStatus.AVAILABLE " +
           "AND v.approvalStatus = com.carrental.admin.enums.ApprovalDecision.APPROVED " +
           "AND (CAST(:city AS string) IS NULL OR CAST(:city AS string) = '' OR LOWER(v.location) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%'))) " +
           "AND (:vehicleType IS NULL OR v.vehicleType = :vehicleType) " +
           "AND (:seatingCapacity IS NULL OR v.seatingCapacity >= :seatingCapacity)")
    List<Vehicle> searchAvailableVehicles(@Param("city") String city,
                                         @Param("vehicleType") VehicleType vehicleType,
                                         @Param("seatingCapacity") Integer seatingCapacity);

    Page<Vehicle> findByStatus(VehicleStatus status, Pageable pageable);

    @Query(value = "SELECT v FROM Vehicle v JOIN FETCH v.owner WHERE v.status = :status",
           countQuery = "SELECT count(v) FROM Vehicle v WHERE v.status = :status")
    Page<Vehicle> findAllByStatusWithOwner(@Param("status") VehicleStatus status, Pageable pageable);

    @Query(value = "SELECT v FROM Vehicle v JOIN FETCH v.owner WHERE v.approvalStatus = :approvalStatus",
           countQuery = "SELECT count(v) FROM Vehicle v WHERE v.approvalStatus = :approvalStatus")
    Page<Vehicle> findAllByApprovalStatusWithOwner(@Param("approvalStatus") ApprovalDecision approvalStatus, Pageable pageable);

    @Query("SELECT v FROM Vehicle v JOIN FETCH v.owner WHERE v.id = :id")
    Optional<Vehicle> findByIdWithOwner(@Param("id") Long id);

    long countByStatusIn(Collection<VehicleStatus> statuses);
}

