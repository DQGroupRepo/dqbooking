package com.booking.dto.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminBookingTrendResponse {

    private String period;

    private long bookings;
}