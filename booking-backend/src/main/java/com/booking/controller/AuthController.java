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
import com.booking.dto.auth.*;
import com.booking.service.impl.PasswordRecoveryService;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.booking.repository.UserRepository;
import com.booking.service.email.EmailService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    private final JwtService jwtService;
    private final PasswordRecoveryService passwordRecoveryService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EmailService emailService;

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


    @PostMapping("/forgot-password/request-otp")
    public java.util.Map<String, String> requestPasswordOtp(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordRecoveryService.requestOtp(request);
        return java.util.Map.of("message", "If an account exists for this email, a password reset OTP has been sent.");
    }

    @PostMapping("/forgot-password/verify-otp")
    public java.util.Map<String, String> verifyPasswordOtp(@Valid @RequestBody VerifyResetOtpRequest request) {
        passwordRecoveryService.verify(request);
        return java.util.Map.of("message", "OTP verified successfully.");
    }

    @PostMapping("/forgot-password/reset")
    public java.util.Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordRecoveryService.reset(request);
        return java.util.Map.of("message", "Password reset successfully. Please sign in with your new password.");
    }

    @PostMapping("/change-password")
    public java.util.Map<String, String> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        User user = (User) authentication.getPrincipal();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword()))
            throw new IllegalArgumentException("Current password is incorrect.");
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setActiveSessionId(null); user.setActiveSessionExpiresAt(null);
        userRepository.save(user);
        emailService.sendPasswordChanged(user.getEmail());
        return java.util.Map.of("message", "Password changed successfully. Please sign in again.");
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