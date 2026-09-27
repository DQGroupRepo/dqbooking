package com.booking.controller;

import com.booking.dto.vendor.VendorPermissionsResponse;
import com.booking.service.VendorPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vendor/permissions")
@RequiredArgsConstructor
public class VendorPermissionController {

    private final VendorPermissionService vendorPermissionService;

    @GetMapping
    public VendorPermissionsResponse getCurrentPermissions() {

        return vendorPermissionService
                .getCurrentPermissions();
    }
}