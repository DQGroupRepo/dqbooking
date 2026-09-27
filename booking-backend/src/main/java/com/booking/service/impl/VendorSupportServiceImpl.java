package com.booking.service.impl;

import com.booking.model.User;
import com.booking.model.VendorSupportSession;
import com.booking.model.enums.Role;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorSupportSessionRepository;
import com.booking.service.VendorSupportService;
import com.booking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorSupportServiceImpl
        implements VendorSupportService {

    private final VendorSupportSessionRepository
            supportSessionRepository;

    private final UserRepository
            userRepository;

    public VendorSupportSession startSupport(
            String vendorId
    ) {

        User admin =
                SecurityUtil.getCurrentUser();

        if (
                admin.getRole() != Role.ADMIN
        ) {

            log.warn(
                    "Vendor support start denied userId={} role={}",
                    admin.getId(),
                    admin.getRole()
            );

            throw new AccessDeniedException(
                    "Only administrators can enter vendor support mode."
            );
        }

        log.info(
                "Starting vendor support adminId={} vendorId={}",
                admin.getId(),
                vendorId
        );

        User vendorAdmin =
                userRepository
                        .findById(vendorId)
                        .orElseThrow(() -> {
                            log.warn(
                                    "VendorAdmin not found for support adminId={} vendorId={}",
                                    admin.getId(),
                                    vendorId
                            );

                            return new IllegalArgumentException(
                                    "VendorAdmin not found."
                            );
                        });

        if (
                vendorAdmin.getRole()
                        != Role.VENDOR_ADMIN
        ) {

            log.warn(
                    "Vendor support target is not a VendorAdmin adminId={} vendorId={} role={}",
                    admin.getId(),
                    vendorId,
                    vendorAdmin.getRole()
            );

            throw new IllegalArgumentException(
                    "Selected user is not a VendorAdmin."
            );
        }

        supportSessionRepository
                .findByAdminIdAndActiveTrue(
                        admin.getId()
                )
                .ifPresent(existing -> {

                    log.info(
                            "Ending existing vendor support session sessionId={} adminId={}",
                            existing.getId(),
                            admin.getId()
                    );

                    existing.setActive(false);

                    existing.setEndedAt(
                            LocalDateTime.now()
                    );

                    supportSessionRepository.save(
                            existing
                    );
                });

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

        VendorSupportSession savedSession =
                supportSessionRepository.save(
                        session
                );

        log.info(
                "Vendor support session started sessionId={} adminId={} vendorId={}",
                savedSession.getId(),
                admin.getId(),
                vendorAdmin.getId()
        );

        return savedSession;
    }

    public VendorSupportSession getCurrentSupport() {

        User admin =
                SecurityUtil.getCurrentUser();

        VendorSupportSession session =
                supportSessionRepository
                        .findByAdminIdAndActiveTrue(
                                admin.getId()
                        )
                        .orElse(null);

        log.debug(
                "Retrieved current vendor support session adminId={} activeSessionPresent={}",
                admin.getId(),
                session != null
        );

        return session;
    }

    public void endSupport() {

        User admin =
                SecurityUtil.getCurrentUser();

        supportSessionRepository
                .findByAdminIdAndActiveTrue(
                        admin.getId()
                )
                .ifPresentOrElse(
                        session -> {

                            session.setActive(false);

                            session.setEndedAt(
                                    LocalDateTime.now()
                            );

                            supportSessionRepository.save(
                                    session
                            );

                            log.info(
                                    "Vendor support session ended sessionId={} adminId={}",
                                    session.getId(),
                                    admin.getId()
                            );
                        },
                        () -> log.debug(
                                "No active vendor support session to end adminId={}",
                                admin.getId()
                        )
                );
    }
}
