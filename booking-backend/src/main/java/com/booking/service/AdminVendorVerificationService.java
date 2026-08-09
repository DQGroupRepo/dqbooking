package com.booking.service;

import com.booking.dto.admin.AdminVendorVerificationResponse;

import java.util.List;

public interface AdminVendorVerificationService {

    List<AdminVendorVerificationResponse>
    getVendors();

    AdminVendorVerificationResponse
    getVendor(String vendorId);

    void approveVendor(String vendorId);

    void rejectVendor(String vendorId);

    void suspendVendor(String vendorId);

    void reactivateVendor(String vendorId);
}