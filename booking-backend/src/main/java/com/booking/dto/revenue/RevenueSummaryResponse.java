package com.booking.dto.revenue;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class RevenueSummaryResponse {

    private BigDecimal thisMonth;

    private BigDecimal totalRevenue;

    private BigDecimal pendingPayments;

    private BigDecimal averageBookingValue;

}
