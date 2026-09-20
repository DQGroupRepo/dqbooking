package com.booking.service.impl;

import com.booking.dto.vendorprofile.UpdateVendorProfileRequest;
import com.booking.dto.vendorprofile.VendorProfileResponse;
import com.booking.mapper.VendorProfileMapper;
import com.booking.model.User;
import com.booking.repository.UserRepository;
import com.booking.service.VendorAccessService;
import com.booking.service.VendorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.booking.model.enums.VendorPage;
import com.booking.service.VendorPermissionService;

@Service
@RequiredArgsConstructor
public class VendorProfileServiceImpl
        implements VendorProfileService {

    private final VendorAccessService vendorAccessService;
    private final VendorPermissionService vendorPermissionService;

    private final UserRepository userRepository;

    private final VendorProfileMapper mapper;


    @Override
    public VendorProfileResponse getProfile() {

        vendorPermissionService.checkView(
                VendorPage.PROFILE
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        User vendor =
                userRepository
                        .findById(vendorId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Vendor not found."
                                )
                        );

        return mapper.toResponse(vendor);
    }


    @Override
    public VendorProfileResponse updateProfile(
            UpdateVendorProfileRequest request) {

        vendorPermissionService.checkEdit(
                VendorPage.PROFILE
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        User vendor =
                userRepository
                        .findById(vendorId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Vendor not found."
                                )
                        );

        mapper.updateEntity(
                vendor,
                request
        );

        vendor =
                userRepository.save(
                        vendor
                );

        return mapper.toResponse(vendor);
    }

}