package com.booking.mapper;

import com.booking.dto.pricing.CreateVendorServicePricingRequest;
import com.booking.dto.vendorservice.ServicePricingDto;

public interface PricingRequestMapper {

    CreateVendorServicePricingRequest toPricingRequest(
            ServicePricingDto dto
    );

}