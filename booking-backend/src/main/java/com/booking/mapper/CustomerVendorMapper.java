package com.booking.mapper;

import com.booking.dto.customer.VendorDetailResponse;
import com.booking.dto.customer.VendorListingResponse;
import com.booking.model.Vendor;
import com.booking.model.VendorService;

public interface CustomerVendorMapper {

    VendorListingResponse toListing(
            Vendor vendor,
            VendorService service
    );

    VendorDetailResponse toDetail(
            Vendor vendor,
            VendorService service
    );

}