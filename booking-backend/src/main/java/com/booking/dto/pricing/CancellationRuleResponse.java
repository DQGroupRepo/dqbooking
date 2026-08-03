package com.booking.dto.pricing;

import com.booking.model.enums.CancellationChargeType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class CancellationRuleResponse {

    private Integer minimumDaysBeforeEvent;

    private CancellationChargeType chargeType;

    private BigDecimal chargeValue;
}