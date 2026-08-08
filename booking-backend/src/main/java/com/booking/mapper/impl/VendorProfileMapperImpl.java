package com.booking.mapper.impl;

import com.booking.dto.vendorprofile.UpdateVendorProfileRequest;
import com.booking.dto.vendorprofile.VendorProfileResponse;
import com.booking.mapper.VendorProfileMapper;
import com.booking.model.User;
import org.springframework.stereotype.Component;

@Component
public class VendorProfileMapperImpl
        implements VendorProfileMapper {

    @Override
    public VendorProfileResponse toResponse(
            User vendor
    ) {

        return VendorProfileResponse.builder()
                .id(vendor.getId())
                .businessName(vendor.getBusinessName())
                .ownerName(vendor.getFullName())
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
            User vendor,
            UpdateVendorProfileRequest request
    ) {

        vendor.setBusinessName(
                request.getBusinessName()
        );

        /*
         * ownerName is represented by
         * firstName + lastName in User.
         */
        String ownerName = request.getOwnerName();

        if (ownerName != null && !ownerName.isBlank()) {

            String trimmed = ownerName.trim();

            int spaceIndex = trimmed.indexOf(" ");

            if (spaceIndex > 0) {

                vendor.setFirstName(
                        trimmed.substring(0, spaceIndex)
                );

                vendor.setLastName(
                        trimmed.substring(spaceIndex + 1)
                );

            } else {

                vendor.setFirstName(trimmed);

                vendor.setLastName("");

            }
        }

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