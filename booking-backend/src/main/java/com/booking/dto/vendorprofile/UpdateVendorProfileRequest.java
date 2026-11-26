package com.booking.dto.vendorprofile;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateVendorProfileRequest {

    @NotBlank
    private String businessName;

    @NotBlank
    private String ownerName;

    @NotBlank
    private String phone;

    @NotBlank
    private String city;

    @NotBlank
    private String address;

    private String description;
    private String state;
    private String pincode;
    private String logo;
    private String accountHolder;
    private String bankName;
    private String accountNumber;
    private String ifsc;
    private String upiId;
    private String payoutMethod;
    private String gstNumber;
    private String panNumber;
    private String businessLicense;
    private String gstCertificateUrl;
    private String panCardUrl;
    private String businessLicenseUrl;
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private Boolean bookingAlerts;
    private Boolean reviewAlerts;
    private Boolean paymentAlerts;
    private Boolean marketingEmails;

}