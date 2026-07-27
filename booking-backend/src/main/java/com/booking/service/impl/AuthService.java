package com.booking.service.impl;

import com.booking.dto.login.LoginRequest;
import com.booking.dto.login.LoginResponse;
import com.booking.dto.register.RegisterRequest;
import com.booking.dto.register.VendorRegisterRequest;
import com.booking.dto.register.VendorRegisterResponse;
import com.booking.exception.InvalidCredentialsException;
import com.booking.model.User;
import com.booking.model.Vendor;
import com.booking.model.enums.Role;
import com.booking.model.enums.UserStatus;
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


        /*
         * Determine the display name.
         *
         * Vendor:
         *     Display the vendor business name.
         *
         * Customer:
         *     Display the customer's full name.
         *
         * Admin:
         *     Display the admin's full name.
         */

        String name;


        if (user.getRole() == Role.VENDOR) {

            Vendor vendor = vendorRepository
                    .findByUserId(user.getId())
                    .orElse(null);


            if (vendor != null &&
                    vendor.getBusinessName() != null) {

                name = vendor.getBusinessName();

            } else {

                name = user.getFullName();

            }

        } else {

            name = user.getFullName();

        }


        /*
         * Generate JWT.
         *
         * JWT contains:
         *     subject = userId
         *     role    = user role
         */

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

    public void register(RegisterRequest request) {

        /*
         * Check whether email already exists
         */

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {

            throw new IllegalArgumentException(
                    "Email already registered"
            );

        }


        /*
         * Create new customer
         */

        User user = new User();

        user.setEmail(request.getEmail());

        user.setPhone(request.getPhone());

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(Role.CUSTOMER);


        /*
         * Save customer
         */

        userRepository.save(user);

    }

    public VendorRegisterResponse registerVendor(
            VendorRegisterRequest request
    ) {

        /*
         * Check if email already exists
         */

        if (userRepository
                .findByEmail(request.getEmail())
                .isPresent()) {

            throw new RuntimeException(
                    "An account with this email already exists"
            );

        }


        /*
         * Create User
         */

        User user = new User();

        user.setEmail(
                request.getEmail()
        );

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setFirstName(
                request.getFullName()
        );

        user.setRole(
                Role.VENDOR
        );

        user.setStatus(
                UserStatus.ACTIVE
        );


        /*
         * Save User first
         * so we get the generated user ID.
         */

        User savedUser =
                userRepository.save(user);


        /*
         * Create Vendor Profile
         */

        Vendor vendor = new Vendor();

        vendor.setUserId(
                savedUser.getId()
        );

        vendor.setBusinessName(
                request.getBusinessName()
        );

        vendor.setOwnerName(
                request.getOwnerName()
        );

        vendor.setPhone(
                request.getPhone()
        );

        vendor.setCity(
                request.getCity()
        );

        vendor.setAddress(
                request.getAddress()
        );

        vendor.setDescription(
                request.getDescription()
        );

        vendor.setRating(
                0.0
        );

        vendor.setTotalReviews(
                0
        );

        vendor.setVerified(
                false
        );


        /*
         * Save Vendor
         */

        Vendor savedVendor =
                vendorRepository.save(vendor);


        /*
         * Return Registration Response
         */

        return VendorRegisterResponse
                .builder()

                .userId(
                        savedUser.getId()
                )

                .vendorId(
                        savedVendor.getId()
                )

                .email(
                        savedUser.getEmail()
                )

                .businessName(
                        savedVendor.getBusinessName()
                )

                .message(
                        "Vendor registration successful"
                )

                .build();

    }

}