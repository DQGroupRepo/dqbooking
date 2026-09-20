package com.booking.service.impl;

import com.booking.model.User;
import com.booking.model.VendorSupportSession;
import com.booking.model.enums.Role;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorSupportSessionRepository;
import com.booking.service.VendorSupportService;
import com.booking.util.SecurityUtil;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VendorSupportServiceImpl
        implements VendorSupportService {


    private final VendorSupportSessionRepository
            supportSessionRepository;

    private final UserRepository
            userRepository;


    /*
     * =========================================
     * START SUPPORT
     * =========================================
     */

    @Override
    public VendorSupportSession startSupport(
            String vendorId
    ) {

        /*
         * Get the currently authenticated user.
         */

        User admin =
                SecurityUtil.getCurrentUser();


        /*
         * Only ADMIN can start vendor support.
         */

        if (
                admin.getRole() != Role.ADMIN
        ) {

            throw new AccessDeniedException(
                    "Only administrators can enter vendor support mode."
            );
        }


        /*
         * =========================================
         * VENDOR ID = VENDOR ADMIN USER ID
         * =========================================
         *
         * The canonical vendorId is now the
         * VendorAdmin's User._id.
         *
         * Therefore the selected vendorId
         * directly identifies the VendorAdmin.
         */

        User vendorAdmin =
                userRepository
                        .findById(vendorId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "VendorAdmin not found."
                                )
                        );


        /*
         * Only a VendorAdmin represents a
         * vendor account.
         */

        if (
                vendorAdmin.getRole()
                        != Role.VENDOR_ADMIN
        ) {

            throw new IllegalArgumentException(
                    "Selected user is not a VendorAdmin."
            );
        }


        /*
         * =========================================
         * END EXISTING SUPPORT SESSION
         * =========================================
         */

        supportSessionRepository
                .findByAdminIdAndActiveTrue(
                        admin.getId()
                )
                .ifPresent(existing -> {

                    existing.setActive(false);

                    existing.setEndedAt(
                            LocalDateTime.now()
                    );

                    supportSessionRepository.save(
                            existing
                    );
                });


        /*
         * =========================================
         * CREATE SUPPORT SESSION
         * =========================================
         *
         * vendorId stores the VendorAdmin's
         * User._id.
         */

        VendorSupportSession session =
                new VendorSupportSession();


        session.setAdminId(
                admin.getId()
        );


        session.setVendorId(
                vendorAdmin.getId()
        );


        session.setStartedAt(
                LocalDateTime.now()
        );


        session.setActive(
                true
        );


        return supportSessionRepository.save(
                session
        );
    }


    /*
     * =========================================
     * CURRENT SUPPORT SESSION
     * =========================================
     */

    @Override
    public VendorSupportSession getCurrentSupport() {

        User admin =
                SecurityUtil.getCurrentUser();


        return supportSessionRepository
                .findByAdminIdAndActiveTrue(
                        admin.getId()
                )
                .orElse(null);
    }


    /*
     * =========================================
     * END SUPPORT SESSION
     * =========================================
     */

    @Override
    public void endSupport() {

        User admin =
                SecurityUtil.getCurrentUser();


        supportSessionRepository
                .findByAdminIdAndActiveTrue(
                        admin.getId()
                )
                .ifPresent(session -> {

                    session.setActive(false);

                    session.setEndedAt(
                            LocalDateTime.now()
                    );

                    supportSessionRepository.save(
                            session
                    );
                });
    }
}