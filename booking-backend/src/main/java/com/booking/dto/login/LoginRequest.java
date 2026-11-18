package com.booking.dto.login;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    /** Set only after the user confirms replacing an existing login. */
    private boolean replaceExistingSession;

}