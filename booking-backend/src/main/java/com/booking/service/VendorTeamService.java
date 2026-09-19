package com.booking.service;

import com.booking.dto.vendor.VendorTeamMemberRequest;
import com.booking.dto.vendor.VendorTeamMemberResponse;
import com.booking.dto.vendor.VendorUserPermissionRequest;

import java.util.List;

public interface VendorTeamService {

    VendorTeamMemberResponse createVendorUser(
            VendorTeamMemberRequest request
    );

    List<VendorTeamMemberResponse> getTeamMembers();

    VendorTeamMemberResponse getTeamMember(
            String userId
    );

    VendorTeamMemberResponse updateVendorUser(
            String userId,
            VendorTeamMemberRequest request
    );

    VendorTeamMemberResponse updateVendorUserStatus(
            String userId,
            boolean active
    );

    void deleteVendorUser(
            String userId
    );

    void updatePermissions(
            String userId,
            VendorUserPermissionRequest request
    );
}