package com.booking.dto.booking;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BookingCancellationResponse {

    private String bookingId;

    private String bookingNumber;

    private BigDecimal cancellationCharge;

    private BigDecimal refundableAmount;

    private String bookingStatus;

    private String paymentStatus;

    private String message;

}