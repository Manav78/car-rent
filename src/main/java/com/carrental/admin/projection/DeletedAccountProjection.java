package com.carrental.admin.projection;

import java.time.LocalDateTime;

public interface DeletedAccountProjection {
    Long getUserId();
    String getFullName();
    String getEmail();
    String getMobileNumber();
    String getAccountOrigin();
    String getRoles();
    String getDeleteReason();
    String getDeletedByName();
    LocalDateTime getDeletedAt();
    LocalDateTime getCreatedAt();
}

