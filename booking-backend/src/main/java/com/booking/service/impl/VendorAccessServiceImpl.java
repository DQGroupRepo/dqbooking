package com.booking.service.impl;

import com.booking.model.User;
import com.booking.model.enums.Role;
import com.booking.model.VendorSupportSession;
import com.booking.repository.VendorSupportSessionRepository;
import com.booking.service.VendorAccessService;
import com.booking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VendorAccessServiceImpl
        implements VendorAccessService {

    private final VendorSupportSessionRepository
            supportSessionRepository;

    @Override
    public String getEffectiveVendorId() {

        User user =
                SecurityUtil.getCurrentUser();


        /*
         * =========================================
         * VENDOR ADMIN
         * =========================================
         *
         * VendorAdmin's own User ID is the
         * canonical vendor ID.
         */

        if (user.getRole() == Role.VENDOR_ADMIN) {

            return user.getId();
        }


        /*
         * =========================================
         * VENDOR USER
         * =========================================
         *
         * VendorUser stores the owning
         * VendorAdmin's User ID in vendorId.
         */

        if (user.getRole() == Role.VENDOR_USER) {

            if (user.getVendorId() == null ||
                    user.getVendorId().isBlank()) {

                throw new AccessDeniedException(
                        "Vendor account is not assigned."
                );
            }

            return user.getVendorId();
        }


        /*
         * =========================================
         * PLATFORM ADMIN SUPPORT MODE
         * =========================================
         */

        if (user.getRole() == Role.ADMIN) {

            VendorSupportSession session =
                    supportSessionRepository
                            .findByAdminIdAndActiveTrue(
                                    user.getId()
                            )
                            .orElseThrow(() ->
                                    new AccessDeniedException(
                                            "Active vendor support mode is required."
                                    )
                            );

            if (session.getVendorId() == null ||
                    session.getVendorId().isBlank()) {

                throw new AccessDeniedException(
                        "Vendor account is not assigned."
                );
            }

            return session.getVendorId();
        }


        throw new AccessDeniedException(
                "Vendor access is not permitted."
        );
    }
}