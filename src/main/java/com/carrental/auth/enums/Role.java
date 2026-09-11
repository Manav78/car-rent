package com.carrental.auth.enums;

public enum Role {
    CUSTOMER,
    OWNER,
    ADMIN,
    DRIVER;

    public String getRoleName() {
        return name();
    }
}

