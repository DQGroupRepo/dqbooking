package com.booking.service;

import com.booking.dto.vendorenquiry.CreateVendorEnquiryRequest;
import com.booking.dto.vendorenquiry.VendorEnquiryResponse;

import java.time.LocalDate;
import java.util.List;

public interface VendorEnquiryService {

    VendorEnquiryResponse createEnquiry(CreateVendorEnquiryRequest request);

    List<VendorEnquiryResponse> getEnquiriesForDate(LocalDate eventDate);
}
