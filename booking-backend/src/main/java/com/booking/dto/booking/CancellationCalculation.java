package com.booking.dto.booking;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class CancellationCalculation {

    private Integer daysBeforeEvent;

    private Integer refundPercentage;

    private BigDecimal refundableAmount;

    private BigDecimal cancellationCharge;

    private Integer processingDays;

}