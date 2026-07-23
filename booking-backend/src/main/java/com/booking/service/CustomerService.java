package com.booking.service;

import com.booking.dto.customer.VendorDetailResponse;
import com.booking.dto.customer.VendorListingResponse;

import java.util.List;

public interface CustomerService {
    VendorDetailResponse getServiceById(
            String serviceId
    );

    List<VendorListingResponse> getVendorListings(String category);
}
