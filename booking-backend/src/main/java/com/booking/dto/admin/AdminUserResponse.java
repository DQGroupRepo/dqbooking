package com.booking.dto.admin;

import com.booking.model.enums.Role;
import com.booking.model.enums.UserStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminUserResponse {

    private String id;

    private String email;

    private String firstName;

    private String lastName;

    private String phone;

    private Role role;

    private UserStatus status;

    private LocalDateTime lastLogin;

    private LocalDateTime createdAt;

    private Boolean active;

    private Boolean deleted;
}