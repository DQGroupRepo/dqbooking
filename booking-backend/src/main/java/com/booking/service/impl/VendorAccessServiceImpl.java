package com.booking.service.impl;

import com.booking.model.User;
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
         * NORMAL VENDOR
         * =========================================
         */

        if (
                user.getRole() != null &&
                        "VENDOR".equalsIgnoreCase(
                                user.getRole().name()
                        )
        ) {

            return user.getId();

        }


        /*
         * =========================================
         * ADMIN SUPPORT MODE
         * =========================================
         */

        if (
                user.getRole() != null &&
                        "ADMIN".equalsIgnoreCase(
                                user.getRole().name()
                        )
        ) {

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


            return session.getVendorId();

        }


        /*
         * =========================================
         * OTHER ROLES
         * =========================================
         */

        throw new AccessDeniedException(
                "Vendor access is not permitted."
        );

    }

}