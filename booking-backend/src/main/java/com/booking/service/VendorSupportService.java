package com.booking.service;

import com.booking.model.VendorSupportSession;

public interface VendorSupportService {

    VendorSupportSession startSupport(
            String vendorId
    );

    VendorSupportSession getCurrentSupport();

    void endSupport();

}