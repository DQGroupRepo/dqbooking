package com.booking.mapper.impl;

import com.booking.dto.vendorprofile.UpdateVendorProfileRequest;
import com.booking.dto.vendorprofile.VendorProfileResponse;
import com.booking.mapper.VendorProfileMapper;
import com.booking.model.User;
import org.springframework.stereotype.Component;

@Component
public class VendorProfileMapperImpl
        implements VendorProfileMapper {

    @Override
    public VendorProfileResponse toResponse(
            User vendor
    ) {

        return VendorProfileResponse.builder()
                .id(vendor.getId())
                .businessName(vendor.getBusinessName())
                .ownerName(vendor.getFullName())
                .phone(vendor.getPhone())
                .city(vendor.getCity())
                .address(vendor.getAddress())
                .description(vendor.getDescription())
                .email(vendor.getEmail()).state(vendor.getState()).pincode(vendor.getPincode()).logo(vendor.getLogo())
                .accountHolder(vendor.getAccountHolder()).bankName(vendor.getBankName()).accountNumber(vendor.getAccountNumber()).ifsc(vendor.getIfsc()).upiId(vendor.getUpiId()).payoutMethod(vendor.getPayoutMethod())
                .gstNumber(vendor.getGstNumber()).panNumber(vendor.getPanNumber()).businessLicense(vendor.getBusinessLicense())
                .gstCertificateUrl(vendor.getGstCertificateUrl()).panCardUrl(vendor.getPanCardUrl()).businessLicenseUrl(vendor.getBusinessLicenseUrl())
                .emailNotifications(vendor.getEmailNotifications()).smsNotifications(vendor.getSmsNotifications()).bookingAlerts(vendor.getBookingAlerts()).reviewAlerts(vendor.getReviewAlerts()).paymentAlerts(vendor.getPaymentAlerts()).marketingEmails(vendor.getMarketingEmails())
                .verificationStatus(vendor.getVerificationStatus())
                .build();

    }

    @Override
    public void updateEntity(
            User vendor,
            UpdateVendorProfileRequest request
    ) {

        vendor.setBusinessName(
                request.getBusinessName()
        );

        /*
         * ownerName is represented by
         * firstName + lastName in User.
         */
        String ownerName = request.getOwnerName();

        if (ownerName != null && !ownerName.isBlank()) {

            String trimmed = ownerName.trim();

            int spaceIndex = trimmed.indexOf(" ");

            if (spaceIndex > 0) {

                vendor.setFirstName(
                        trimmed.substring(0, spaceIndex)
                );

                vendor.setLastName(
                        trimmed.substring(spaceIndex + 1)
                );

            } else {

                vendor.setFirstName(trimmed);

                vendor.setLastName("");

            }
        }

        vendor.setPhone(
                request.getPhone()
        );

        vendor.setCity(
                request.getCity()
        );

        vendor.setAddress(
                request.getAddress()
        );

        vendor.setDescription(request.getDescription());
        vendor.setState(request.getState()); vendor.setPincode(request.getPincode()); vendor.setLogo(request.getLogo());
        vendor.setAccountHolder(request.getAccountHolder()); vendor.setBankName(request.getBankName());
        vendor.setAccountNumber(request.getAccountNumber()); vendor.setIfsc(request.getIfsc()); vendor.setUpiId(request.getUpiId()); vendor.setPayoutMethod(request.getPayoutMethod());
        vendor.setGstNumber(request.getGstNumber()); vendor.setPanNumber(request.getPanNumber()); vendor.setBusinessLicense(request.getBusinessLicense());
        vendor.setGstCertificateUrl(request.getGstCertificateUrl()); vendor.setPanCardUrl(request.getPanCardUrl()); vendor.setBusinessLicenseUrl(request.getBusinessLicenseUrl());
        if (request.getEmailNotifications()!=null) vendor.setEmailNotifications(request.getEmailNotifications());
        if (request.getSmsNotifications()!=null) vendor.setSmsNotifications(request.getSmsNotifications());
        if (request.getBookingAlerts()!=null) vendor.setBookingAlerts(request.getBookingAlerts());
        if (request.getReviewAlerts()!=null) vendor.setReviewAlerts(request.getReviewAlerts());
        if (request.getPaymentAlerts()!=null) vendor.setPaymentAlerts(request.getPaymentAlerts());
        if (request.getMarketingEmails()!=null) vendor.setMarketingEmails(request.getMarketingEmails());

    }

}