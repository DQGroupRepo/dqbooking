package com.booking.dto.pricing;

import com.booking.model.enums.CancellationChargeType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CancellationRuleRequest {

    @NotNull
    private Integer minimumDaysBeforeEvent;

    @NotNull
    private CancellationChargeType chargeType;

    @DecimalMin(value = "0.0")
    private BigDecimal chargeValue;
}