package com.booking.dto.vendorservice;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@Data
public class RecentBookingDto {

    private String bookingId;

    private String customerName;

    private String serviceName;

    private LocalDateTime bookingFrom;

    private LocalDateTime bookingTo;

    private String status;

    private BigDecimal amount;

}