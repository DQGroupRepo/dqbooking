package com.booking.dto.revenue;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class MonthlyRevenueResponse {

    private String month;

    private BigDecimal revenue;

}
