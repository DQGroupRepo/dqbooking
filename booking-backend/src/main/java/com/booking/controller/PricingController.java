package com.booking.controller;

import com.booking.dto.pricing.PricingCalculationResult;
import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.pricing.VendorServicePricingResponse;
import com.booking.service.PricingCalculationService;
import com.booking.service.VendorServicePricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingCalculationService
            pricingCalculationService;

    private final VendorServicePricingService
            vendorServicePricingService;


    /*
     * =========================================
     * GET CURRENT PRICING CONFIGURATION
     * =========================================
     *
     * Used by vendor/frontend to retrieve
     * the current pricing configuration.
     */
    @GetMapping("/services/{serviceId}")
    public VendorServicePricingResponse getServicePricing(
            @PathVariable String serviceId
    ) {

        return vendorServicePricingService
                .getCurrentPricing(serviceId);
    }


    /*
     * =========================================
     * CALCULATE BOOKING PRICE
     * =========================================
     *
     * Checkout calls this endpoint before
     * submitting the booking.
     *
     * The pricing service is responsible for:
     *
     * 1. Finding the pricing version applicable
     *    to the event date.
     *
     * 2. Finding the selected package inside
     *    that pricing version.
     *
     * 3. Calculating the final price.
     *
     * Example:
     *
     * GET /api/pricing/services/{serviceId}/calculate
     *     ?eventDate=2026-08-15
     *     &packageId=PACKAGE_ID
     */
    @GetMapping("/services/{serviceId}/calculate")
    public PricingCalculationResult calculatePrice(

            @PathVariable String serviceId,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate eventDate,

            @RequestParam(
                    required = false
            )
            String packageId

    ) {

        return pricingCalculationService
                .calculatePrice(
                        serviceId,
                        eventDate,
                        packageId
                );
    }


    /*
     * =========================================
     * CREATE PRICING CONFIGURATION
     * =========================================
     *
     * Packages are now submitted as part of the
     * pricing document.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VendorServicePricingResponse createPricing(

            @Valid
            @RequestBody
            VendorServicePricingRequest request

    ) {

        return vendorServicePricingService
                .createPricing(request);
    }


    /*
     * =========================================
     * GET PRICING BY ID
     * =========================================
     */
    @GetMapping("/{pricingId}")
    public VendorServicePricingResponse getPricingById(
            @PathVariable String pricingId
    ) {

        return vendorServicePricingService
                .getPricing(pricingId);
    }
}