package com.booking.model;

import com.booking.model.enums.CancellationChargeType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CancellationRule {

    /*
     * Example:
     *
     * 30
     * means 30 or more days before event.
     */
    private Integer minimumDaysBeforeEvent;

    private CancellationChargeType chargeType;

    private BigDecimal chargeValue;
}