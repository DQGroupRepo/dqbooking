package com.booking.service;

import com.booking.model.VendorPricingHead;

import java.math.BigDecimal;

public interface PricingHeadCalculator {

    BigDecimal calculate(
            VendorPricingHead pricingHead,
            BigDecimal baseAmount,
            Integer guestCount
    );

}
