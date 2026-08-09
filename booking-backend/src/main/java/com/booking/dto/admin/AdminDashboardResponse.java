package com.booking.dto.admin;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class AdminDashboardResponse {

    private long totalUsers;

    private long totalVendors;

    private long totalBookings;

    private BigDecimal totalRevenue;


    private long pendingBookings;

    private long confirmedBookings;

    private long completedBookings;

    private long cancelledBookings;


    private long activeCustomers;

    private long activeVendors;

    private long activeServices;

    private long totalReviews;

    private List<AdminRecentBookingResponse> recentBookings;

    private List<AdminBookingTrendResponse> bookingTrend;

    private List<AdminRevenueTrendResponse> revenueTrend;

    private AdminPendingActionsResponse pendingActions;

}