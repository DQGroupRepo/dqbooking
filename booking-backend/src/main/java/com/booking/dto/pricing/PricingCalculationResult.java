package com.booking.dto.pricing;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class PricingCalculationResult {

    private String pricingId;

    private Integer pricingVersion;

    private BigDecimal baseAmount;

    private List<PricingHeadSnapshot> pricingHeads;

    private BigDecimal subtotal;

    private List<DiscountSnapshot> discounts;

    private BigDecimal discountAmount;

    private BigDecimal totalAmount;

    private BigDecimal advanceAmount;

    private BigDecimal balanceAmount;
}