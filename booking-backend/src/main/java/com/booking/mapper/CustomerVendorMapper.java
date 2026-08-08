package com.booking.mapper;

import com.booking.dto.customer.VendorDetailResponse;
import com.booking.dto.customer.VendorListingResponse;
import com.booking.model.User;
import com.booking.model.VendorService;

public interface CustomerVendorMapper {

    VendorListingResponse toListing(
            User vendor,
            VendorService service
    );

    VendorDetailResponse toDetail(
            User vendor,
            VendorService service
    );

}