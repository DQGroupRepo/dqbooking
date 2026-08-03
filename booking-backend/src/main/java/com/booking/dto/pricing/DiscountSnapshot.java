package com.booking.dto.pricing;

import com.booking.model.enums.DiscountType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class DiscountSnapshot {

    private String name;

    private DiscountType discountType;

    private BigDecimal value;

    private BigDecimal calculatedAmount;
}