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
import com.booking.model.enums.VendorVerificationStatus;
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


    public LoginResponse login(
            LoginRequest request
    ) {

        User user =
                userRepository
                        .findByEmail(
                                request.getEmail()
                        )
                        .orElseThrow(
                                InvalidCredentialsException::new
                        );


        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {

            throw new InvalidCredentialsException();

        }


        /*
         * =========================================
         * DISPLAY NAME
         * =========================================
         */

        String name;


        if (user.getRole() == Role.VENDOR) {

            if (
                    user.getBusinessName() != null &&
                            !user.getBusinessName().isBlank()
            ) {

                name =
                        user.getBusinessName();

            } else {

                name =
                        user.getFullName();

            }

        } else {

            name =
                    user.getFullName();

        }


        /*
         * =========================================
         * GENERATE JWT
         * =========================================
         */

        String token =
                jwtService.generateToken(

                        user.getId(),

                        user.getRole().name()

                );


        return LoginResponse.builder()

                .token(token)

                .userId(
                        user.getId()
                )

                .role(
                        user.getRole().name()
                )

                .name(name)

                .build();

    }


    /*
     * =========================================
     * CUSTOMER REGISTRATION
     * =========================================
     */

    public void register(
            RegisterRequest request
    ) {

        if (
                userRepository
                        .findByEmail(
                                request.getEmail()
                        )
                        .isPresent()
        ) {

            throw new IllegalArgumentException(
                    "Email already registered"
            );

        }


        User user =
                new User();


        user.setEmail(
                request.getEmail()
        );

        user.setPhone(
                request.getPhone()
        );

        user.setPassword(

                passwordEncoder.encode(
                        request.getPassword()
                )

        );

        user.setRole(
                Role.CUSTOMER
        );

        user.setStatus(
                UserStatus.ACTIVE
        );


        userRepository.save(
                user
        );

    }


    /*
     * =========================================
     * VENDOR REGISTRATION
     * =========================================
     */

    public VendorRegisterResponse registerVendor(
            VendorRegisterRequest request
    ) {

        /*
         * Check email
         */

        if (
                userRepository
                        .findByEmail(
                                request.getEmail()
                        )
                        .isPresent()
        ) {

            throw new RuntimeException(
                    "An account with this email already exists"
            );

        }


        /*
         * =========================================
         * CREATE VENDOR
         * =========================================
         */

        User vendor =
                new User();


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


        /*
         * Account exists and is enabled.
         *
         * Approval is controlled separately by
         * verificationStatus.
         */

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
         * Owner name
         */

        String ownerName =
                request.getOwnerName();


        if (
                ownerName != null &&
                        !ownerName.isBlank()
        ) {

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
         * Vendor approval starts as pending.
         */

        vendor.setVerificationStatus(

                VendorVerificationStatus.PENDING

        );


        /*
         * =========================================
         * SAVE
         * =========================================
         */

        User savedVendor =
                userRepository.save(
                        vendor
                );


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