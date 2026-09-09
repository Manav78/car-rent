package com.carrental.owner.mapper;

import com.carrental.auth.entity.User;
import com.carrental.driver.entity.DriverProfile;
import com.carrental.owner.dto.response.OwnerResponse;
import com.carrental.owner.entity.OwnerProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OwnerMapper {

    @Mapping(target = "id", source = "profile.id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "firstName", source = "user.firstName")
    @Mapping(target = "lastName", source = "user.lastName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "phoneNumber", source = "user.phoneNumber")
    @Mapping(target = "role", source = "user.role")
    @Mapping(target = "status", expression = "java(profile != null ? profile.getStatus() : com.carrental.owner.enums.OwnerStatus.PENDING)")
    @Mapping(target = "willingToDrive", expression = "java(driverProfile != null && Boolean.TRUE.equals(driverProfile.getWillingToDrive()))")
    @Mapping(target = "drivingLicenseNumber", source = "driverProfile.drivingLicenseNumber")
    @Mapping(target = "licenseExpiryDate", source = "driverProfile.licenseExpiryDate")
    @Mapping(target = "createdAt", source = "user.createdAt")
    OwnerResponse toResponse(User user, OwnerProfile profile, DriverProfile driverProfile);
}
