package com.booking.model;

import com.booking.model.enums.DiscountType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class VendorDiscount {

    private String name;

    private DiscountType discountType;

    private BigDecimal value;

    private LocalDate validFrom;

    private LocalDate validUntil;

    private Boolean active = true;
}