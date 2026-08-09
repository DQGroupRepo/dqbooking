package com.booking.repository;

import java.math.BigDecimal;

public interface AdminRevenueTrendProjection {

    String getPeriod();

    BigDecimal getRevenue();
}