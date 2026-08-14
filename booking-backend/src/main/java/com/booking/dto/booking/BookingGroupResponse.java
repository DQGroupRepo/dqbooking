package com.booking.dto.booking;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class BookingGroupResponse {

    private String bookingGroupId;

    private String customerId;

    private String eventType;

    private String specialRequest;

    private BigDecimal originalTotal;

    private BigDecimal totalDiscount;

    private BigDecimal finalTotal;

    private boolean bundleApplied;

    private int qualifyingServiceCount;

    private List<BookingResponse> bookings;

}
