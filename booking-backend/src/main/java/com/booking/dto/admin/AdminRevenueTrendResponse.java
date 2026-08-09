package com.booking.dto.admin;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AdminRevenueTrendResponse {

    private String period;

    private BigDecimal revenue;
}