package com.booking.service.impl;

import com.booking.model.VendorAccount;
import com.booking.model.VendorPlan;
import com.booking.model.enums.Role;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorAccountRepository;
import com.booking.service.VendorAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VendorAccountServiceImpl
        implements VendorAccountService {

    private final VendorAccountRepository vendorAccountRepository;

    private final UserRepository userRepository;


    /*
     * =========================================
     * CREATE VENDOR ACCOUNT
     * =========================================
     *
     * Every newly registered vendor starts
     * with the BASIC plan.
     *
     * BASIC allows zero VendorUsers.
     *
     * Platform Admin can later change the
     * plan and VendorUser limit.
     *
     * vendorAdminId = VendorAdmin User._id
     */

    @Override
    public VendorAccount createVendorAccount(
            String businessName,
            String vendorAdminId
    ) {

        VendorAccount account =
                VendorAccount.builder()
                        .vendorAdminId(vendorAdminId)
                        .businessName(businessName)
                        .plan(VendorPlan.BASIC)
                        .maxVendorUsers(0)
                        .active(true)
                        .build();

        return vendorAccountRepository.save(account);
    }


    /*
     * =========================================
     * CHECK VENDOR USER LIMIT
     * =========================================
     */

    @Override
    public void checkVendorUserLimit(
            String vendorId
    ) {

        /*
         * vendorId is the VendorAdmin User._id.
         *
         * VendorAccount has its own Mongo _id,
         * so it must be located using
         * vendorAdminId.
         */

        VendorAccount account =
                vendorAccountRepository
                        .findByVendorAdminId(vendorId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Vendor account not found."
                                )
                        );


        if (!account.isActive()) {

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

            throw new IllegalStateException(
                    "VendorUser limit reached. " +
                            "Your current plan allows " +
                            maximum +
                            " VendorUser(s)."
            );
        }
    }


    /*
     * =========================================
     * GET VENDOR USER COUNT
     * =========================================
     */

    @Override
    public int getVendorUserCount(
            String vendorId
    ) {

        return (int) userRepository
                .countByVendorIdAndRole(
                        vendorId,
                        Role.VENDOR_USER
                );
    }


    /*
     * =========================================
     * GET MAX VENDOR USERS
     * =========================================
     */

    @Override
    public int getMaxVendorUsers(
            String vendorId
    ) {

        /*
         * vendorId is the VendorAdmin User._id.
         */

        VendorAccount account =
                vendorAccountRepository
                        .findByVendorAdminId(vendorId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Vendor account not found."
                                )
                        );


        return account.getMaxVendorUsers() == null
                ? 0
                : account.getMaxVendorUsers();
    }
}