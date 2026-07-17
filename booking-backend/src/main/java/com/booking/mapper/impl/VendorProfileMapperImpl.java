package com.booking.mapper.impl;

import com.booking.dto.vendorprofile.UpdateVendorProfileRequest;
import com.booking.dto.vendorprofile.VendorProfileResponse;
import com.booking.mapper.VendorProfileMapper;
import com.booking.model.Vendor;
import org.springframework.stereotype.Component;

@Component
public class VendorProfileMapperImpl
        implements VendorProfileMapper {

    @Override
    public VendorProfileResponse toResponse(
            Vendor vendor
    ) {

        return VendorProfileResponse.builder()
                .id(vendor.getId())
                .businessName(vendor.getBusinessName())
                .ownerName(vendor.getOwnerName())
                .phone(vendor.getPhone())
                .city(vendor.getCity())
                .address(vendor.getAddress())
                .description(vendor.getDescription())
                .rating(vendor.getRating())
                .totalReviews(vendor.getTotalReviews())
                .verified(vendor.getVerified())
                .build();

    }

    @Override
    public void updateEntity(
            Vendor vendor,
            UpdateVendorProfileRequest request
    ) {

        vendor.setBusinessName(
                request.getBusinessName()
        );

        vendor.setOwnerName(
                request.getOwnerName()
        );

        vendor.setPhone(
                request.getPhone()
        );

        vendor.setCity(
                request.getCity()
        );

        vendor.setAddress(
                request.getAddress()
        );

        vendor.setDescription(
                request.getDescription()
        );

    }

}