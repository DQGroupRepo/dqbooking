package com.booking.dto.pricing;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefundRuleRequest {

    @NotNull
    @Min(0)
    private Integer minDaysBeforeEvent;

    /*
     * Nullable.
     *
     * Null = No upper limit.
     */
    private Integer maxDaysBeforeEvent;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer refundPercentage;

}