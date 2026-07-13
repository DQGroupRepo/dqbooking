package com.booking.mapper;

import com.booking.dto.vendorservice.VendorServiceRequest;
import com.booking.dto.vendorservice.VendorServiceResponse;
import com.booking.model.Vendor;
import com.booking.model.VendorService;

public interface VendorServiceMapper {

    VendorService toEntity(
            VendorServiceRequest request,
            Vendor vendor
    );

    VendorServiceResponse toResponse(
            VendorService entity
    );

    void updateEntity(
            VendorService entity,
            VendorServiceRequest request
    );

}