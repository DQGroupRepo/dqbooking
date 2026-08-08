package com.booking.dto.pricing;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefundRuleResponse {

    private Integer minDaysBeforeEvent;

    private Integer maxDaysBeforeEvent;

    private Integer refundPercentage;

}