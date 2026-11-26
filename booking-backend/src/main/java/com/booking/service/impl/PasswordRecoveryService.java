package com.booking.service.impl;

import com.booking.dto.auth.*;
import com.booking.model.User;
import com.booking.repository.UserRepository;
import com.booking.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PasswordRecoveryService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    public void requestOtp(ForgotPasswordRequest request) {
        users.findByEmailIgnoreCase(request.getEmail().trim()).ifPresent(user -> {
            LocalDateTime now = LocalDateTime.now();
            if (user.getPasswordResetOtpRequestedAt() != null && user.getPasswordResetOtpRequestedAt().plusSeconds(60).isAfter(now)) return;
            String otp = String.format("%06d", random.nextInt(1_000_000));
            user.setPasswordResetOtpHash(encoder.encode(otp));
            user.setPasswordResetOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
            user.setPasswordResetOtpAttempts(0);
            user.setPasswordResetOtpRequestedAt(now);
            users.save(user);
            try {
                emailService.sendOtp(user.getEmail(), otp);
            } catch (RuntimeException ex) {
                user.setPasswordResetOtpHash(null);
                user.setPasswordResetOtpExpiresAt(null);
                user.setPasswordResetOtpRequestedAt(null);
                users.save(user);
                throw ex;
            }
        });
    }

    public void verify(VerifyResetOtpRequest request) {
        User user = validUser(request.getEmail(), request.getOtp());
        if (user == null) throw new IllegalArgumentException("Invalid or expired OTP. Please request a new OTP.");
    }

    public void reset(ResetPasswordRequest request) {
        User user = validUser(request.getEmail(), request.getOtp());
        if (user == null) throw new IllegalArgumentException("Invalid or expired OTP. Please request a new OTP.");
        user.setPassword(encoder.encode(request.getNewPassword()));
        clearOtp(user);
        user.setActiveSessionId(null); user.setActiveSessionExpiresAt(null);
        users.save(user);
        emailService.sendPasswordChanged(user.getEmail());
    }

    private User validUser(String email, String otp) {
        User user = users.findByEmailIgnoreCase(email.trim()).orElse(null);
        if (user == null || user.getPasswordResetOtpHash() == null || user.getPasswordResetOtpExpiresAt() == null) return null;
        if (user.getPasswordResetOtpExpiresAt().isBefore(LocalDateTime.now()) || user.getPasswordResetOtpAttempts() >= 5) return null;
        if (!encoder.matches(otp, user.getPasswordResetOtpHash())) {
            user.setPasswordResetOtpAttempts(user.getPasswordResetOtpAttempts() + 1); users.save(user); return null;
        }
        return user;
    }
    private void clearOtp(User user) { user.setPasswordResetOtpHash(null); user.setPasswordResetOtpExpiresAt(null); user.setPasswordResetOtpAttempts(0); user.setPasswordResetOtpRequestedAt(null); }
}
