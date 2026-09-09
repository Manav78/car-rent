package com.carrental.auth.entity;

import com.carrental.auth.enums.Role;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "mobile", nullable = false, unique = true, length = 255)
    private String mobile;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role_name", nullable = false, length = 255)
    private Set<Role> roles = new HashSet<>();

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by_user_id")
    private User deletedByUser;

    @Column(name = "delete_reason", columnDefinition = "TEXT")
    private String deleteReason;

    @Transient
    private boolean accountNonLocked = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public User(Long id, String name, String firstName, String lastName, String mobile, String phoneNumber,
                String email, String password, Role role, Set<Role> roles,
                Boolean emailVerified, Boolean isActive, Boolean enabled,
                LocalDateTime deletedAt, User deletedByUser, String deleteReason, Boolean accountNonLocked,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        if (name != null) {
            this.name = name;
        } else if (firstName != null || lastName != null) {
            this.name = ((firstName != null ? firstName.trim() : "") + 
                         (lastName != null && !lastName.isEmpty() ? " " + lastName.trim() : "")).trim();
        }
        this.mobile = mobile != null ? mobile : phoneNumber;
        this.email = email;
        this.password = password;
        this.roles = new HashSet<>();
        if (roles != null && !roles.isEmpty()) {
            for (Role r : roles) {
                try {
                    this.roles.add(Role.valueOf(r.name().replace("ROLE_", "")));
                } catch (Exception e) {
                    this.roles.add(r);
                }
            }
        } else if (role != null) {
            try {
                this.roles.add(Role.valueOf(role.name().replace("ROLE_", "")));
            } catch (Exception e) {
                this.roles.add(role);
            }
        }
        this.emailVerified = emailVerified != null ? emailVerified : false;
        this.isActive = isActive != null ? isActive : (enabled != null ? enabled : true);
        this.deletedAt = deletedAt;
        this.deletedByUser = deletedByUser;
        this.deleteReason = deleteReason;
        this.accountNonLocked = accountNonLocked != null ? accountNonLocked : true;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.emailVerified == null) {
            this.emailVerified = false;
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Convenience & backwards-compatibility helper methods
    public String getFirstName() {
        if (name == null || name.isBlank()) return "";
        String[] parts = name.trim().split("\\s+", 2);
        return parts[0];
    }

    public void setFirstName(String firstName) {
        String last = getLastName();
        String f = firstName != null ? firstName.trim() : "";
        this.name = (f + (!last.isEmpty() ? " " + last : "")).trim();
    }

    public String getLastName() {
        if (name == null || name.isBlank()) return "";
        String[] parts = name.trim().split("\\s+", 2);
        return parts.length > 1 ? parts[1] : "";
    }

    public void setLastName(String lastName) {
        String first = getFirstName();
        String l = lastName != null ? lastName.trim() : "";
        this.name = ((!first.isEmpty() ? first + " " : "") + l).trim();
    }

    public String getPhoneNumber() {
        return mobile;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.mobile = phoneNumber;
    }

    public boolean isEmailVerified() {
        return Boolean.TRUE.equals(emailVerified);
    }

    public boolean isEnabled() {
        return Boolean.TRUE.equals(isActive);
    }

    public void setEnabled(boolean enabled) {
        this.isActive = enabled;
    }

    public String getFullName() {
        return name != null ? name : "";
    }

    public Role getRole() {
        if (roles == null || roles.isEmpty()) {
            return null;
        }
        Role first = roles.iterator().next();
        try {
            return Role.valueOf(first.name().replace("ROLE_", ""));
        } catch (Exception e) {
            try {
                return Role.valueOf(first.name());
            } catch (Exception ignored) {
                return null;
            }
        }
    }

    public void setRole(Role role) {
        if (this.roles == null) {
            this.roles = new HashSet<>();
        }
        this.roles.clear();
        if (role != null) {
            String base = role.name().replace("ROLE_", "");
            try {
                this.roles.add(Role.valueOf(base));
            } catch (Exception e) {
                this.roles.add(role);
            }
        }
    }

    public void addRole(Role role) {
        if (this.roles == null) {
            this.roles = new HashSet<>();
        }
        if (role != null) {
            String base = role.name().replace("ROLE_", "");
            try {
                this.roles.add(Role.valueOf(base));
            } catch (Exception e) {
                this.roles.add(role);
            }
        }
    }
}

