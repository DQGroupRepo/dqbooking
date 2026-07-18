package com.booking.service;

import com.booking.dto.revenue.MonthlyRevenueResponse;
import com.booking.dto.revenue.PaymentHistoryResponse;
import com.booking.dto.revenue.RevenueSummaryResponse;

import java.util.List;

public interface RevenueService {

    RevenueSummaryResponse getSummary();

    List<MonthlyRevenueResponse> getMonthlyRevenue();

    List<PaymentHistoryResponse> getPaymentHistory();

}
