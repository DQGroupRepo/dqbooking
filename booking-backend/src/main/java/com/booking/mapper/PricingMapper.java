package com.booking.mapper;

import com.booking.dto.pricing.CreateVendorServicePricingRequest;
import com.booking.dto.pricing.VendorServicePricingResponse;
import com.booking.model.VendorServicePricing;

public interface PricingMapper {

    VendorServicePricing toEntity(
            CreateVendorServicePricingRequest request
    );

    VendorServicePricingResponse toResponse(
            VendorServicePricing pricing
    );
}