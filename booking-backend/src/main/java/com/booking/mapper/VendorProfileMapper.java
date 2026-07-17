package com.booking.mapper;

import com.booking.dto.vendorprofile.UpdateVendorProfileRequest;
import com.booking.dto.vendorprofile.VendorProfileResponse;
import com.booking.model.Vendor;

public interface VendorProfileMapper {

    VendorProfileResponse toResponse(
            Vendor vendor
    );

    void updateEntity(
            Vendor vendor,
            UpdateVendorProfileRequest request
    );

}