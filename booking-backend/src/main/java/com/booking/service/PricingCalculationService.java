package com.booking.service;

import com.booking.dto.pricing.PricingCalculationResult;

import java.time.LocalDate;
import java.math.BigDecimal;

public interface PricingCalculationService {

    PricingCalculationResult calculatePrice(
            String serviceId,
            LocalDate eventDate,
            String packageId
    );

    PricingCalculationResult calculatePrice(
            String serviceId,
            LocalDate eventDate,
            String packageId,
            Integer guestCount
    );

    PricingCalculationResult calculatePriceWithBaseAmount(String serviceId, LocalDate eventDate,
                                                           String packageId, Integer guestCount, BigDecimal baseAmount);
}