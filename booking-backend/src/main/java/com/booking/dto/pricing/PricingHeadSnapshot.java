package com.booking.dto.pricing;

import com.booking.model.enums.PricingCalculationType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class PricingHeadSnapshot {

    private String code;

    private String name;

    private PricingCalculationType calculationType;

    private BigDecimal value;

    private BigDecimal calculatedAmount;

    private Integer displayOrder;
}