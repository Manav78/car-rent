package com.carrental.vehicle.mapper;

import com.carrental.vehicle.dto.response.VehicleResponse;
import com.carrental.vehicle.entity.Vehicle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface VehicleMapper {

    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "ownerName", expression = "java(vehicle.getOwner() != null ? vehicle.getOwner().getFullName() : null)")
    @Mapping(target = "ownerEmail", expression = "java(vehicle.getOwner() != null ? vehicle.getOwner().getEmail() : null)")
    VehicleResponse toResponse(Vehicle vehicle);
}
