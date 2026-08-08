package com.booking.service;

import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.pricing.VendorServicePricingResponse;

public interface VendorServicePricingService {

    /*
     * Create a new pricing version.
     */
    VendorServicePricingResponse createPricing(
            VendorServicePricingRequest request
    );


    /*
     * Get pricing by pricing ID.
     */
    VendorServicePricingResponse getPricingById(
            String pricingId
    );


    /*
     * Get the current/latest pricing configuration
     * for a service.
     */
    VendorServicePricingResponse getCurrentPricing(
            String serviceId
    );

    VendorServicePricingResponse getPricing(
            String pricingId
    );

}