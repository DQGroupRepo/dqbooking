package com.booking.model.embedded;

import com.booking.model.enums.PricingCalculationType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BookingPricingHeadSnapshot {

    private String code;

    private String name;

    private PricingCalculationType calculationType;

    private BigDecimal value;

    private BigDecimal calculatedAmount;

    private Integer displayOrder;
}