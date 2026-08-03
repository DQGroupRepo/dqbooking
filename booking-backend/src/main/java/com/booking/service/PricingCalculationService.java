package com.booking.service;

import com.booking.dto.pricing.PricingCalculationResult;

import java.time.LocalDate;

public interface PricingCalculationService {

    PricingCalculationResult calculatePrice(
            String serviceId,
            LocalDate eventDate
    );

}