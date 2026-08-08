package com.booking.service.impl;

import com.booking.dto.vendorprofile.UpdateVendorProfileRequest;
import com.booking.dto.vendorprofile.VendorProfileResponse;
import com.booking.mapper.VendorProfileMapper;
import com.booking.model.User;
import com.booking.repository.UserRepository;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.VendorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VendorProfileServiceImpl
        implements VendorProfileService {

    private final AuthenticatedUserService authenticatedUserService;

    private final UserRepository userRepository;

    private final VendorProfileMapper mapper;

    @Override
    public VendorProfileResponse getProfile() {

        User vendor =
                authenticatedUserService.getCurrentVendor();

        return mapper.toResponse(vendor);
    }

    @Override
    public VendorProfileResponse updateProfile(
            UpdateVendorProfileRequest request) {

        User vendor =
                authenticatedUserService.getCurrentVendor();

        mapper.updateEntity(
                vendor,
                request
        );

        vendor =
                userRepository.save(vendor);

        return mapper.toResponse(vendor);
    }
}