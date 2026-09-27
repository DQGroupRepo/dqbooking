package com.booking.service.impl;

import com.booking.model.VendorAccount;
import com.booking.model.VendorPlan;
import com.booking.model.enums.Role;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorAccountRepository;
import com.booking.service.VendorAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorAccountServiceImpl
        implements VendorAccountService {

    private final VendorAccountRepository vendorAccountRepository;

    private final UserRepository userRepository;

    @Override
    public VendorAccount createVendorAccount(
            String businessName,
            String vendorAdminId
    ) {

        log.info(
                "Creating vendor account vendorAdminId={}",
                vendorAdminId
        );

        VendorAccount account =
                VendorAccount.builder()
                        .vendorAdminId(vendorAdminId)
                        .businessName(businessName)
                        .plan(VendorPlan.BASIC)
                        .maxVendorUsers(0)
                        .active(true)
                        .build();

        VendorAccount savedAccount =
                vendorAccountRepository.save(account);

        log.info(
                "Vendor account created accountId={} vendorAdminId={} plan={}",
                savedAccount.getId(),
                vendorAdminId,
                savedAccount.getPlan()
        );

        return savedAccount;
    }

    @Override
    public void checkVendorUserLimit(
            String vendorId
    ) {

        VendorAccount account =
                vendorAccountRepository
                        .findByVendorAdminId(vendorId)
                        .orElseThrow(() -> {
                            log.warn(
                                    "Vendor account not found while checking user limit vendorId={}",
                                    vendorId
                            );

                            return new IllegalStateException(
                                    "Vendor account not found."
                            );
                        });

        if (!account.isActive()) {

            log.warn(
                    "Vendor user creation denied because vendor account is inactive vendorId={} accountId={}",
                    vendorId,
                    account.getId()
            );

            throw new AccessDeniedException(
                    "Vendor account is inactive."
            );
        }

        int currentCount =
                getVendorUserCount(
                        vendorId
                );

        int maximum =
                account.getMaxVendorUsers() == null
                        ? 0
                        : account.getMaxVendorUsers();

        if (currentCount >= maximum) {

            log.warn(
                    "Vendor user limit reached vendorId={} currentCount={} maximum={}",
                    vendorId,
                    currentCount,
                    maximum
            );

            throw new IllegalStateException(
                    "VendorUser limit reached. " +
                            "Your current plan allows " +
                            maximum +
                            " VendorUser(s)."
            );
        }

        log.debug(
                "Vendor user limit check passed vendorId={} currentCount={} maximum={}",
                vendorId,
                currentCount,
                maximum
        );
    }

    @Override
    public int getVendorUserCount(
            String vendorId
    ) {

        int count =
                (int) userRepository
                        .countByVendorIdAndRole(
                                vendorId,
                                Role.VENDOR_USER
                        );

        log.debug(
                "Retrieved vendor user count vendorId={} count={}",
                vendorId,
                count
        );

        return count;
    }

    @Override
    public int getMaxVendorUsers(
            String vendorId
    ) {

        VendorAccount account =
                vendorAccountRepository
                        .findByVendorAdminId(vendorId)
                        .orElseThrow(() -> {
                            log.warn(
                                    "Vendor account not found while retrieving maximum users vendorId={}",
                                    vendorId
                            );

                            return new IllegalStateException(
                                    "Vendor account not found."
                            );
                        });

        int maximum =
                account.getMaxVendorUsers() == null
                        ? 0
                        : account.getMaxVendorUsers();

        log.debug(
                "Retrieved maximum vendor users vendorId={} maximum={}",
                vendorId,
                maximum
        );

        return maximum;
    }
}
