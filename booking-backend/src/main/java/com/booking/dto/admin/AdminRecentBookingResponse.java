package com.booking.dto.admin;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class AdminRecentBookingResponse {

    private String id;

    private String bookingNumber;

    private String customerName;

    private String serviceName;

    private LocalDateTime bookingFrom;

    private LocalDateTime bookingTo;

    private BigDecimal totalAmount;

    private String status;

}