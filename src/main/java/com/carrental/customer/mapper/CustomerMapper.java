package com.carrental.customer.mapper;

import com.carrental.auth.entity.User;
import com.carrental.customer.dto.CustomerResponse;
import com.carrental.customer.entity.CustomerProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CustomerMapper {

    @Mapping(target = "id", source = "user.id")
    @Mapping(target = "firstName", source = "user.firstName")
    @Mapping(target = "lastName", source = "user.lastName")
    @Mapping(target = "fullName", expression = "java(user.getFullName())")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "phoneNumber", source = "user.phoneNumber")
    @Mapping(target = "role", source = "user.role")
    @Mapping(target = "emailVerified", source = "user.emailVerified")
    @Mapping(target = "createdAt", source = "user.createdAt")
    @Mapping(target = "address", source = "profile.address")
    @Mapping(target = "city", source = "profile.city")
    @Mapping(target = "postalCode", source = "profile.postalCode")
    CustomerResponse toResponse(User user, CustomerProfile profile);
}
