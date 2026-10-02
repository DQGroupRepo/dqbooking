package com.booking.service;

import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.pricing.VendorServicePricingResponse;
import com.booking.dto.pricing.VendorServicePricingVersionResponse;

import java.util.List;

public interface VendorServicePricingService {

    VendorServicePricingResponse createPricing(
            VendorServicePricingRequest request
    );

    VendorServicePricingResponse getPricing(
            String pricingId
    );

    VendorServicePricingResponse getPricingById(
            String pricingId
    );

    VendorServicePricingResponse getCurrentPricing(
            String serviceId
    );

    List<VendorServicePricingVersionResponse>
    getPricingVersions(
            String serviceId
    );
}
