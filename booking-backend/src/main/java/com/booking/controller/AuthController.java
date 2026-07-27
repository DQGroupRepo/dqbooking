package com.booking.controller;

import com.booking.dto.login.LoginRequest;
import com.booking.dto.login.LoginResponse;
import com.booking.dto.register.RegisterRequest;
import com.booking.dto.register.VendorRegisterRequest;
import com.booking.dto.register.VendorRegisterResponse;
import com.booking.service.impl.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

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

}