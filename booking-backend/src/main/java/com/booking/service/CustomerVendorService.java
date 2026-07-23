package com.booking.service;

import com.booking.dto.customer.VendorListingResponse;

import java.util.List;

public interface CustomerVendorService {

    List<VendorListingResponse> getListings();

}