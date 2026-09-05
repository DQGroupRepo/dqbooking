package com.booking.dto.login;

import com.booking.model.enums.Role;

public record AuthUserResponse(
        String userId,
        Role role,
        String name
) {
}