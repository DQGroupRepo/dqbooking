package com.booking.service.impl;

import com.booking.dto.login.LoginRequest;
import com.booking.dto.login.LoginResponse;
import com.booking.exception.InvalidCredentialsException;
import com.booking.model.User;
import com.booking.model.Vendor;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorRepository;
import com.booking.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final VendorRepository vendorRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                 .findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new InvalidCredentialsException();
        }

        Vendor vendor = vendorRepository

                .findByUserId(user.getId())

                .orElse(null);

        String name = "";

        if (vendor != null) {

            name = vendor.getBusinessName();

        }

        String token = jwtService.generateToken(

                user.getId(),

                user.getRole().name()

        );

        return LoginResponse.builder()

                .token(token)

                .userId(user.getId())

                .role(user.getRole().name())

                .name(name)

                .build();
    }

}