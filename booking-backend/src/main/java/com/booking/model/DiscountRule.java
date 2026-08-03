package com.booking.model;

import com.booking.model.enums.DiscountType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class DiscountRule {

    private String id;

    private String name;

    private DiscountType discountType;

    private BigDecimal value;

    /*
     * Optional minimum booking amount.
     */
    private BigDecimal minimumBookingAmount;

    /*
     * Optional maximum discount amount.
     */
    private BigDecimal maximumDiscountAmount;

    private Boolean active = true;
}