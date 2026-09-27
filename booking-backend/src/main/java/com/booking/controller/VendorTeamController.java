package com.booking.controller;

import com.booking.dto.vendor.VendorTeamMemberRequest;
import com.booking.dto.vendor.VendorTeamMemberResponse;
import com.booking.dto.vendor.VendorUserPermissionRequest;
import com.booking.service.VendorTeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor/team")
@RequiredArgsConstructor
public class VendorTeamController {

    private final VendorTeamService vendorTeamService;

    @PostMapping
    public VendorTeamMemberResponse createVendorUser(
            @RequestBody VendorTeamMemberRequest request
    ) {

        return vendorTeamService
                .createVendorUser(request);
    }

    @GetMapping
    public List<VendorTeamMemberResponse>
    getTeamMembers() {

        return vendorTeamService
                .getTeamMembers();
    }

    @GetMapping("/{userId}")
    public VendorTeamMemberResponse getTeamMember(
            @PathVariable String userId
    ) {

        return vendorTeamService
                .getTeamMember(userId);
    }

    @PutMapping("/{userId}")
    public VendorTeamMemberResponse updateVendorUser(
            @PathVariable String userId,
            @RequestBody VendorTeamMemberRequest request
    ) {

        return vendorTeamService
                .updateVendorUser(
                        userId,
                        request
                );
    }

    @PatchMapping("/{userId}/status")
    public VendorTeamMemberResponse updateStatus(
            @PathVariable String userId,
            @RequestParam boolean active
    ) {

        return vendorTeamService
                .updateVendorUserStatus(
                        userId,
                        active
                );
    }

    @DeleteMapping("/{userId}")
    public void deleteVendorUser(
            @PathVariable String userId
    ) {

        vendorTeamService
                .deleteVendorUser(userId);
    }

    @PutMapping("/{userId}/permissions")
    public void updatePermissions(
            @PathVariable String userId,
            @RequestBody
            VendorUserPermissionRequest request
    ) {

        vendorTeamService
                .updatePermissions(
                        userId,
                        request
                );
    }
}