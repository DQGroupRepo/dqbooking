package com.booking.model;

import com.booking.model.enums.PricingCalculationType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class VendorPricingHead {

    private String code;

    private String name;

    private PricingCalculationType calculationType;

    private BigDecimal value;

    private Integer displayOrder;

    private Boolean active = true;
}