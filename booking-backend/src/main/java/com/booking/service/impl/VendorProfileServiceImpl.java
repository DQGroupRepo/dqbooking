package com.booking.service.impl;

import com.booking.dto.vendorprofile.UpdateVendorProfileRequest;
import com.booking.dto.vendorprofile.VendorProfileResponse;
import com.booking.mapper.VendorProfileMapper;
import com.booking.model.User;
import com.booking.repository.UserRepository;
import com.booking.service.VendorAccessService;
import com.booking.service.VendorProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.booking.model.enums.VendorPage;
import com.booking.service.VendorPermissionService;

@Service
@RequiredArgsConstructor
@Slf4j
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

        log.info(
                "Retrieving vendor profile vendorId={}",
                vendorId
        );

        User vendor =
                userRepository
                        .findById(vendorId)
                        .orElseThrow(() -> {
                            log.warn(
                                    "Vendor not found while retrieving profile vendorId={}",
                                    vendorId
                            );

                            return new IllegalStateException(
                                    "Vendor not found."
                            );
                        });

        VendorProfileResponse response =
                mapper.toResponse(vendor);

        log.info(
                "Vendor profile retrieved vendorId={}",
                vendorId
        );

        return response;
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

        log.info(
                "Updating vendor profile vendorId={}",
                vendorId
        );

        User vendor =
                userRepository
                        .findById(vendorId)
                        .orElseThrow(() -> {
                            log.warn(
                                    "Vendor not found while updating profile vendorId={}",
                                    vendorId
                            );

                            return new IllegalStateException(
                                    "Vendor not found."
                            );
                        });

        mapper.updateEntity(
                vendor,
                request
        );

        vendor =
                userRepository.save(
                        vendor
                );

        log.info(
                "Vendor profile updated vendorId={}",
                vendorId
        );

        return mapper.toResponse(vendor);
    }
}
