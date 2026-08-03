package com.booking.model.embedded;

import com.booking.model.enums.DiscountType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BookingDiscountSnapshot {

    private String name;

    private DiscountType discountType;

    private BigDecimal value;

    private BigDecimal calculatedAmount;
}