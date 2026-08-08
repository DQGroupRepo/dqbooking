package com.booking.mapper;

import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.vendorservice.ServicePricingDto;

public interface PricingRequestMapper {

    VendorServicePricingRequest toPricingRequest(
            ServicePricingDto dto
    );

}