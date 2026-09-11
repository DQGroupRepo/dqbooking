package com.booking.dto.admin;

import com.booking.model.enums.VendorVerificationStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdminVendorVerificationResponse {

    private String vendorId;

    private String businessName;

    private String ownerName;

    private String email;

    private String phone;

    private String city;

    private String address;

    private VendorVerificationStatus verificationStatus;

    private List<AdminVendorServiceResponse> services;
}