package com.booking.service.impl;

import com.booking.model.VendorPricingHead;
import com.booking.model.enums.PricingCalculationType;
import com.booking.service.PricingHeadCalculator;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class PercentagePricingHeadCalculator
        implements PricingHeadCalculator {

    @Override
    public BigDecimal calculate(
            VendorPricingHead pricingHead,
            BigDecimal baseAmount,
            Integer guestCount
    ) {

        if (pricingHead.getCalculationType()
                != PricingCalculationType.PERCENTAGE) {

            return BigDecimal.ZERO;
        }

        return baseAmount
                .multiply(pricingHead.getValue())
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP
                );
    }

}
