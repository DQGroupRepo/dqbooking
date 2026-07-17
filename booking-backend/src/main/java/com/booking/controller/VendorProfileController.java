package com.booking.controller;

import com.booking.dto.vendorprofile.UpdateVendorProfileRequest;
import com.booking.dto.vendorprofile.VendorProfileResponse;
import com.booking.service.VendorProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor/profile")
@RequiredArgsConstructor
public class VendorProfileController {

    private final VendorProfileService vendorProfileService;

    @GetMapping
    public VendorProfileResponse getProfile() {

        return vendorProfileService.getProfile();

    }

    @PutMapping
    public VendorProfileResponse updateProfile(

            @Valid
            @RequestBody
            UpdateVendorProfileRequest request) {

        return vendorProfileService.updateProfile(
                request
        );

    }

}