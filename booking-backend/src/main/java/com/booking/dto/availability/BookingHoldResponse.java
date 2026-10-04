package com.booking.dto.availability;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class BookingHoldResponse {

    private String holdId;

    private String serviceId;

    private String slotId;

    private LocalDate eventDate;

    private Integer quantity;

    private LocalDateTime expiresAt;
}