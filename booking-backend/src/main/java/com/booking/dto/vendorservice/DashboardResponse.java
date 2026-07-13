package com.booking.dto.vendorservice;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResponse {

    private String vendorName;

    private int totalBookings;

    private int pendingBookings;

    private int completedBookings;

    private BigDecimal monthlyRevenue;

    private double averageRating;

    private List<RecentBookingDto> recentBookings;

}