package com.booking.dto.booking;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class CancellationPreviewResponse {

    /*
     * Booking details
     */
    private String bookingId;

    private String bookingNumber;

    private LocalDate eventDate;

    /*
     * Pricing
     */
    private BigDecimal totalAmount;

    private BigDecimal paidAmount;

    /*
     * Cancellation calculation
     */
    private Integer daysBeforeEvent;

    private Integer refundPercentage;

    private BigDecimal refundableAmount;

    private BigDecimal cancellationCharge;

    /*
     * Vendor policy
     */
    private Integer processingDays;

    private Boolean cancellationAllowed;

}