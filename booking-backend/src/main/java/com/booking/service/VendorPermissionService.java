package com.booking.service;

import com.booking.dto.vendor.VendorPermissionsResponse;
import com.booking.model.enums.VendorPage;

public interface VendorPermissionService {

    boolean canView(VendorPage page);

    boolean canEdit(VendorPage page);

    void checkView(VendorPage page);

    void checkEdit(VendorPage page);

    VendorPermissionsResponse getCurrentPermissions();
}