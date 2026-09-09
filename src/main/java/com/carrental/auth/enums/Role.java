package com.carrental.auth.enums;

public enum Role {
    CUSTOMER,
    OWNER,
    ADMIN,
    DRIVER,
    ROLE_CUSTOMER,
    ROLE_OWNER,
    ROLE_ADMIN,
    ROLE_DRIVER;

    public String getRoleName() {
        return name().replace("ROLE_", "");
    }
}

