package com.carrental.security.service;

import com.carrental.auth.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Getter
@AllArgsConstructor
@Builder
public class UserDetailsImpl implements UserDetails {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String email;
    private String firstName;
    private String lastName;

    @JsonIgnore
    private String password;

    @Builder.Default
    private boolean enabled = true;

    private Collection<? extends GrantedAuthority> authorities;

    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = new java.util.ArrayList<>();
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            for (com.carrental.auth.enums.Role r : user.getRoles()) {
                String base = r.name().replace("ROLE_", "");
                authorities.add(new SimpleGrantedAuthority("ROLE_" + base));
                authorities.add(new SimpleGrantedAuthority(base));
            }
        } else if (user.getRole() != null) {
            String base = user.getRole().name().replace("ROLE_", "");
            authorities.add(new SimpleGrantedAuthority("ROLE_" + base));
            authorities.add(new SimpleGrantedAuthority(base));
        }

        return UserDetailsImpl.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .password(user.getPassword())
                .enabled(Boolean.TRUE.equals(user.getEmailVerified()) && Boolean.TRUE.equals(user.getIsActive()))
                .authorities(authorities)
                .build();
    }

    public String getFullName() {
        return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

