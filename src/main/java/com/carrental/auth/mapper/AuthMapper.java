package com.carrental.auth.mapper;

import com.carrental.auth.dto.response.UserResponse;
import com.carrental.auth.entity.User;
import com.carrental.customer.dto.request.CustomerSignupRequest;
import com.carrental.owner.dto.request.OwnerSignupRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AuthMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toCustomerEntity(CustomerSignupRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toOwnerEntity(OwnerSignupRequest request);

    @Mapping(target = "emailVerified", source = "emailVerified")
    @Mapping(target = "isActive", source = "isActive")
    @Mapping(target = "enabled", expression = "java(Boolean.TRUE.equals(user.getEmailVerified()) && Boolean.TRUE.equals(user.getIsActive()))")
    UserResponse toUserResponse(User user);
}

