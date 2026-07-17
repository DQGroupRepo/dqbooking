package com.booking.service;

import com.booking.dto.vendorprofile.UpdateVendorProfileRequest;
import com.booking.dto.vendorprofile.VendorProfileResponse;

public interface VendorProfileService {

    VendorProfileResponse getProfile();

    VendorProfileResponse updateProfile(
            UpdateVendorProfileRequest request
    );

}