package com.booking.dto.admin;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class AdminRecentBookingResponse {

    private String id;

    private String bookingNumber;

    private String customerName;

    private String serviceName;

    private LocalDate eventDate;

    private BigDecimal totalAmount;

    private String status;

}