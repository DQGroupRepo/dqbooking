package com.booking.service.impl;

import com.booking.model.User;
import com.booking.model.enums.Role;
import com.booking.model.VendorSupportSession;
import com.booking.repository.VendorSupportSessionRepository;
import com.booking.service.VendorAccessService;
import com.booking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorAccessServiceImpl
        implements VendorAccessService {

    private final VendorSupportSessionRepository
            supportSessionRepository;

    @Override
    public String getEffectiveVendorId() {

        User user =
                SecurityUtil.getCurrentUser();

        if (user.getRole() == Role.VENDOR_ADMIN) {

            log.debug(
                    "Resolved effective vendor for VendorAdmin userId={}",
                    user.getId()
            );

            return user.getId();
        }

        if (user.getRole() == Role.VENDOR_USER) {

            if (user.getVendorId() == null ||
                    user.getVendorId().isBlank()) {

                log.warn(
                        "VendorUser has no vendor assignment userId={}",
                        user.getId()
                );

                throw new AccessDeniedException(
                        "Vendor account is not assigned."
                );
            }

            log.debug(
                    "Resolved effective vendor for VendorUser userId={} vendorId={}",
                    user.getId(),
                    user.getVendorId()
            );

            return user.getVendorId();
        }

        if (user.getRole() == Role.ADMIN) {

            VendorSupportSession session =
                    supportSessionRepository
                            .findByAdminIdAndActiveTrue(
                                    user.getId()
                            )
                            .orElseThrow(() -> {
                                log.warn(
                                        "Vendor access denied because support mode is inactive adminId={}",
                                        user.getId()
                                );

                                return new AccessDeniedException(
                                        "Active vendor support mode is required."
                                );
                            });

            if (session.getVendorId() == null ||
                    session.getVendorId().isBlank()) {

                log.warn(
                        "Active vendor support session has no vendor assignment adminId={} sessionId={}",
                        user.getId(),
                        session.getId()
                );

                throw new AccessDeniedException(
                        "Vendor account is not assigned."
                );
            }

            log.debug(
                    "Resolved effective vendor for support mode adminId={} vendorId={} sessionId={}",
                    user.getId(),
                    session.getVendorId(),
                    session.getId()
            );

            return session.getVendorId();
        }

        log.warn(
                "Vendor access denied for unsupported role userId={} role={}",
                user.getId(),
                user.getRole()
        );

        throw new AccessDeniedException(
                "Vendor access is not permitted."
        );
    }
}
