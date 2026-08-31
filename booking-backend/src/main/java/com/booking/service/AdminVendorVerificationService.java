package com.booking.service;

import com.booking.dto.admin.AdminVendorVerificationResponse;
import com.booking.model.enums.ServiceDiscoveryTag;

import java.util.List;
import java.util.Set;

public interface AdminVendorVerificationService {

    List<AdminVendorVerificationResponse>
    getVendors();

    AdminVendorVerificationResponse
    getVendor(String vendorId);

    void approveVendor(String vendorId);

    void rejectVendor(String vendorId);

    void suspendVendor(String vendorId);

    void reactivateVendor(String vendorId);

    void updateServiceDiscoveryTags(
            String serviceId,
            Set<ServiceDiscoveryTag> tags
    );

}