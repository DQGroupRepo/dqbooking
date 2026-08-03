package com.booking.service.impl;

import com.booking.model.VendorPricingHead;
import com.booking.model.enums.PricingCalculationType;
import com.booking.service.PricingHeadCalculator;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PerGuestPricingHeadCalculator
        implements PricingHeadCalculator {

    @Override
    public BigDecimal calculate(
            VendorPricingHead pricingHead,
            BigDecimal baseAmount,
            Integer guestCount
    ) {

        if (pricingHead.getCalculationType()
                != PricingCalculationType.PER_GUEST) {

            return BigDecimal.ZERO;
        }

        return pricingHead.getValue()
                .multiply(BigDecimal.valueOf(guestCount));
    }

}
