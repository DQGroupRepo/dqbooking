package com.booking.model.embedded;

import com.booking.model.enums.RefundOnType;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CancellationPolicy {

    /*
     * Whether customers are allowed
     * to cancel bookings.
     */
    private Boolean allowCancellation =
            true;

    /*
     * Refund calculation basis.
     *
     * TOTAL_AMOUNT
     *
     * PAID_AMOUNT
     */
    private RefundOnType refundOn =
            RefundOnType.PAID_AMOUNT;

    /*
     * Vendor processing time
     * in business days.
     */
    private Integer processingDays =
            7;

    /*
     * Refund rules.
     */
    private List<RefundRule> refundRules =
            new ArrayList<>();

}