package com.booking.service;

import com.booking.model.VendorAccount;

public interface VendorAccountService {

    VendorAccount createVendorAccount(
            String businessName,
            String vendorAdminId
    );

    void checkVendorUserLimit(String vendorId);

    int getVendorUserCount(String vendorId);

    int getMaxVendorUsers(String vendorId);
}