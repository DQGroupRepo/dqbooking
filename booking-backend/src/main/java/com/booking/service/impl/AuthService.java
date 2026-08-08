package com.booking.service.impl;

import com.booking.dto.login.LoginRequest;
import com.booking.dto.login.LoginResponse;
import com.booking.dto.register.RegisterRequest;
import com.booking.dto.register.VendorRegisterRequest;
import com.booking.dto.register.VendorRegisterResponse;
import com.booking.exception.InvalidCredentialsException;
import com.booking.model.User;
import com.booking.model.enums.Role;
import com.booking.model.enums.UserStatus;
import com.booking.repository.UserRepository;
import com.booking.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

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

            User vendor = userRepository
                    .findById(user.getId())
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
         * =========================================
         * CHECK EMAIL
         * =========================================
         */

        if (userRepository
                .findByEmail(request.getEmail())
                .isPresent()) {

            throw new RuntimeException(
                    "An account with this email already exists"
            );
        }


        /*
         * =========================================
         * CREATE VENDOR USER
         * =========================================
         *
         * A vendor is now simply a User whose
         * role is VENDOR.
         *
         * We intentionally create only ONE User
         * document.
         */

        User vendor = new User();

        /*
         * Account information
         */

        vendor.setEmail(
                request.getEmail()
        );

        vendor.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        vendor.setRole(
                Role.VENDOR
        );

        vendor.setStatus(
                UserStatus.ACTIVE
        );


        /*
         * =========================================
         * VENDOR PROFILE
         * =========================================
         */

        vendor.setBusinessName(
                request.getBusinessName()
        );


        /*
         * ownerName is stored as
         * firstName + lastName.
         */

        String ownerName =
                request.getOwnerName();

        if (ownerName != null &&
                !ownerName.isBlank()) {

            String trimmed =
                    ownerName.trim();

            int spaceIndex =
                    trimmed.indexOf(" ");

            if (spaceIndex > 0) {

                vendor.setFirstName(
                        trimmed.substring(
                                0,
                                spaceIndex
                        )
                );

                vendor.setLastName(
                        trimmed.substring(
                                spaceIndex + 1
                        )
                );

            } else {

                vendor.setFirstName(
                        trimmed
                );

                vendor.setLastName(
                        ""
                );
            }
        }


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


        /*
         * Default vendor values
         */

        vendor.setRating(0.0);

        vendor.setTotalReviews(0);

        vendor.setVerified(false);


        /*
         * =========================================
         * SAVE ONCE
         * =========================================
         */

        User savedVendor =
                userRepository.save(vendor);


        /*
         * =========================================
         * RESPONSE
         * =========================================
         */

        return VendorRegisterResponse
                .builder()

                .userId(
                        savedVendor.getId()
                )

                .vendorId(
                        savedVendor.getId()
                )

                .email(
                        savedVendor.getEmail()
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