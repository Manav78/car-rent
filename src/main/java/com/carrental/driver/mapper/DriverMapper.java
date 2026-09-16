package com.carrental.driver.mapper;

import com.carrental.auth.entity.User;
import com.carrental.driver.dto.response.DriverResponse;
import com.carrental.driver.entity.DriverProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DriverMapper {

    @Mapping(target = "id", source = "profile.id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "firstName", source = "user.firstName")
    @Mapping(target = "lastName", source = "user.lastName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "phoneNumber", source = "user.phoneNumber")
    @Mapping(target = "role", source = "user.role")
    @Mapping(target = "drivingLicenseNumber", source = "profile.drivingLicenseNumber")
    @Mapping(target = "licenseExpiryDate", source = "profile.licenseExpiryDate")
    @Mapping(target = "status", source = "profile.status")
    @Mapping(target = "createdAt", source = "user.createdAt")
    DriverResponse toResponse(User user, DriverProfile profile);
}
