package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefundRule {

    /*
     * Minimum number of days before
     * the event for this rule.
     *
     * Example:
     * 60
     */
    private Integer minDaysBeforeEvent;

    /*
     * Maximum number of days before
     * the event.
     *
     * Null means no upper limit.
     *
     * Example:
     * 89
     */
    private Integer maxDaysBeforeEvent;

    /*
     * Refund percentage.
     *
     * Example:
     * 85
     */
    private Integer refundPercentage;

}