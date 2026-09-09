package com.carrental.admin.service.impl;

import com.carrental.admin.service.AdminMonitoringService;
import com.carrental.admin.dto.response.PageResponse;
import com.carrental.admin.dto.response.VehicleMonitoringResponse;
import com.carrental.auth.entity.User;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.enums.VehicleStatus;
import com.carrental.vehicle.repository.VehicleRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminMonitoringServiceImpl implements AdminMonitoringService {

    private final VehicleRepository vehicleRepository;

    @Transactional(readOnly = true)
    public PageResponse<VehicleMonitoringResponse> getVehicleMonitoring(
            String search,
            String operationalStatus,
            VehicleStatus approvalStatus,
            Pageable pageable
    ) {
        Specification<Vehicle> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Join<Vehicle, User> owner = root.join("owner", JoinType.INNER);

                Predicate brandMatch = cb.like(cb.lower(root.get("brand")), pattern);
                Predicate modelMatch = cb.like(cb.lower(root.get("model")), pattern);
                Predicate plateMatch = cb.like(cb.lower(root.get("licensePlate")), pattern);
                Predicate ownerFirstMatch = cb.like(cb.lower(owner.get("firstName")), pattern);
                Predicate ownerLastMatch = cb.like(cb.lower(owner.get("lastName")), pattern);
                Predicate ownerEmailMatch = cb.like(cb.lower(owner.get("email")), pattern);

                predicates.add(cb.or(brandMatch, modelMatch, plateMatch, ownerFirstMatch, ownerLastMatch, ownerEmailMatch));
            }

            if (approvalStatus != null) {
                predicates.add(cb.equal(root.get("status"), approvalStatus));
            }

            if (operationalStatus != null && !operationalStatus.isBlank()) {
                String op = operationalStatus.trim().toUpperCase();
                if ("ACTIVE".equals(op)) {
                    predicates.add(root.get("status").in(List.of(VehicleStatus.AVAILABLE, VehicleStatus.BOOKED, VehicleStatus.APPROVED)));
                } else if ("INACTIVE".equals(op)) {
                    predicates.add(root.get("status").in(List.of(VehicleStatus.INACTIVE, VehicleStatus.MAINTENANCE, VehicleStatus.PENDING, VehicleStatus.REJECTED)));
                }
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Vehicle> vehicles = vehicleRepository.findAll(spec, pageable);

        Page<VehicleMonitoringResponse> responsePage = vehicles.map(v -> new VehicleMonitoringResponse(
                v.getId(),
                v.getBrand(),
                v.getModel(),
                (v.getBrand() != null ? v.getBrand() : "") + " " + (v.getModel() != null ? v.getModel() : ""),
                v.getVehicleType() != null ? v.getVehicleType().name() : "CAR",
                v.getLicensePlate(),
                v.getOwner() != null ? v.getOwner().getFullName() : "N/A",
                v.getOwner() != null ? v.getOwner().getEmail() : "N/A",
                v.getStatus() != null ? v.getStatus().name() : "PENDING",
                (v.getStatus() == VehicleStatus.AVAILABLE || v.getStatus() == VehicleStatus.BOOKED || v.getStatus() == VehicleStatus.APPROVED) ? "ACTIVE" : "INACTIVE"
        ));

        return PageResponse.from(responsePage);
    }
}

