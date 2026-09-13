package com.booking.service.impl;

import com.booking.model.User;
import com.booking.model.VendorSupportSession;
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
                admin.getRole() == null ||
                        !"ADMIN".equalsIgnoreCase(
                                admin.getRole().toString()
                        )
        ) {

            throw new AccessDeniedException(
                    "Only administrators can enter vendor support mode."
            );
        }


        /*
         * Verify that the selected user exists
         * and is actually a vendor.
         */

        User vendor =
                userRepository
                        .findById(vendorId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Vendor not found."
                                )
                        );


        if (
                vendor.getRole() == null ||
                        !"VENDOR".equalsIgnoreCase(
                                vendor.getRole().toString()
                        )
        ) {

            throw new IllegalArgumentException(
                    "Selected user is not a vendor."
            );
        }


        /*
         * End any existing support session
         * belonging to this admin.
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
         * Create new support session.
         */

        VendorSupportSession session =
                new VendorSupportSession();

        session.setAdminId(
                admin.getId()
        );

        session.setVendorId(
                vendorId
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