package com.booking.controller;

import com.booking.dto.login.LoginRequest;
import com.booking.dto.login.LoginResponse;
import com.booking.dto.register.RegisterRequest;
import com.booking.dto.register.VendorRegisterRequest;
import com.booking.dto.register.VendorRegisterResponse;
import com.booking.service.impl.AuthService;
import com.booking.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.booking.dto.login.AuthUserResponse;
import com.booking.model.User;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    private final JwtService jwtService;

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {

        return authService.login(request);

    }

    @PostMapping("/register")
    public String register(
            @Valid @RequestBody RegisterRequest request
    ) {

        authService.register(request);

        return "Registration successful";

    }

    @PostMapping("/vendor/register")
    public VendorRegisterResponse registerVendor(

            @Valid
            @RequestBody
            VendorRegisterRequest request

    ) {

        return authService.registerVendor(
                request
        );

    }

    @PostMapping("/logout")
    public void logout(Authentication authentication,
                       @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) return;
        String sessionId = null;
        if (authorization != null && authorization.startsWith("Bearer ")) {
            // The filter has already validated this token.
            sessionId = jwtService.extractSessionId(authorization.substring(7));
        }
        authService.logout(user.getId(), sessionId);
    }

    @GetMapping("/me")
    public AuthUserResponse me(
            Authentication authentication
    ) {

        User user =
                (User) authentication.getPrincipal();

        return new AuthUserResponse(
                user.getId(),
                user.getRole(),
                user.getFullName()
        );

    }

}