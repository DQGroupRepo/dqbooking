package com.booking.dto.pricing;

import com.booking.model.enums.DiscountType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class VendorDiscountResponse {

    private String name;

    private DiscountType discountType;

    private BigDecimal value;

    private LocalDate validFrom;

    private LocalDate validUntil;

    private Boolean active;
}