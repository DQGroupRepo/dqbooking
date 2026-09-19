package com.booking.service.impl;

import com.booking.dto.login.LoginRequest;
import com.booking.dto.login.LoginResponse;
import com.booking.dto.register.RegisterRequest;
import com.booking.dto.register.VendorRegisterRequest;
import com.booking.dto.register.VendorRegisterResponse;
import com.booking.exception.InvalidCredentialsException;
import com.booking.model.User;
import com.booking.model.VendorAccount;
import com.booking.model.enums.Role;
import com.booking.model.enums.UserStatus;
import com.booking.model.enums.VendorVerificationStatus;
import com.booking.repository.UserRepository;
import com.booking.security.JwtService;
import com.booking.service.VendorAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final VendorAccountService vendorAccountService;


    /*
     * =========================================
     * LOGIN
     * =========================================
     */

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


        if (user.getRole() == Role.VENDOR_ADMIN ||
                user.getRole() == Role.VENDOR_USER) {

            if (user.getBusinessName() != null &&
                    !user.getBusinessName().isBlank()) {

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

                .token(
                        token
                )

                .userId(
                        user.getId()
                )

                .role(
                        user.getRole().name()
                )

                .name(
                        name
                )

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

        if (userRepository
                .findByEmail(
                        request.getEmail()
                )
                .isPresent()) {

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
     *
     * Registration creates:
     *
     * 1. VendorAdmin User
     * 2. VendorAccount
     *
     * The VendorAdmin User's _id is the
     * canonical vendor ID.
     *
     * VendorAdmin.vendorId is null.
     *
     * VendorAccount.vendorAdminId points to
     * the VendorAdmin User's _id.
     */

    public VendorRegisterResponse registerVendor(
            VendorRegisterRequest request
    ) {
        /*
         * =========================================
         * CREATE VENDOR ADMIN
         * =========================================
         */

        User vendor =
                new User();

        vendor.setEmail(
                request.getEmail()
        );

        vendor.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        vendor.setRole(
                Role.VENDOR_ADMIN
        );

        /*
         * IMPORTANT:
         *
         * VendorAdmin's own User ID is now
         * the canonical vendor ID.
         *
         * VendorAdmin does NOT need a vendorId.
         */
        vendor.setVendorId(
                null
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
         * Owner name
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
         * =========================================
         * VENDOR APPROVAL
         * =========================================
         */

        vendor.setVerificationStatus(
                VendorVerificationStatus.PENDING
        );


        /*
         * =========================================
         * SAVE VENDOR ADMIN
         * =========================================
         */

        User savedVendor =
                userRepository.save(
                        vendor
                );


        /*
         * =========================================
         * CREATE VENDOR ACCOUNT
         * =========================================
         *
         * The VendorAdmin's User ID is the
         * canonical vendor ID.
         */

        VendorAccount vendorAccount =
                vendorAccountService.createVendorAccount(
                        request.getBusinessName(),
                        savedVendor.getId()
                );

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