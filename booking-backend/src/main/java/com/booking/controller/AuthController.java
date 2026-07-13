package com.booking.controller;

import com.booking.dto.login.LoginRequest;
import com.booking.dto.login.LoginResponse;
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

}