package com.booking.mapper;

import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.pricing.VendorServicePricingResponse;
import com.booking.model.VendorServicePricing;

public interface PricingMapper {

    VendorServicePricing toEntity(
            VendorServicePricingRequest request
    );

    VendorServicePricingResponse toResponse(
            VendorServicePricing pricing
    );
}