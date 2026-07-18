package com.booking.controller;

import com.booking.dto.revenue.MonthlyRevenueResponse;
import com.booking.dto.revenue.PaymentHistoryResponse;
import com.booking.dto.revenue.RevenueSummaryResponse;
import com.booking.service.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vendor/revenue")
@RequiredArgsConstructor
public class RevenueController {

    private final RevenueService revenueService;

    @GetMapping("/summary")
    public RevenueSummaryResponse getSummary() {

        return revenueService.getSummary();

    }

    @GetMapping("/monthly")
    public List<MonthlyRevenueResponse> getMonthlyRevenue() {

        return revenueService.getMonthlyRevenue();

    }

    @GetMapping("/payments")
    public List<PaymentHistoryResponse> getPaymentHistory() {

        return revenueService.getPaymentHistory();

    }

}
