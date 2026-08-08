package com.booking.mapper;

import com.booking.dto.vendorprofile.UpdateVendorProfileRequest;
import com.booking.dto.vendorprofile.VendorProfileResponse;
import com.booking.model.User;

public interface VendorProfileMapper {

    VendorProfileResponse toResponse(
            User vendor
    );

    void updateEntity(
            User vendor,
            UpdateVendorProfileRequest request
    );

}