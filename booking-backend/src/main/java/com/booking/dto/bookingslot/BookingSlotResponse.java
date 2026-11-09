package com.booking.dto.bookingslot;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
public class BookingSlotResponse {

    private String id;

    private String serviceId;

    private String slotName;

    private String resourceTypeId;

    private String bookingPattern = "DAILY_RECURRING";

    private LocalTime startTime;

    private LocalTime endTime;

    private Integer maxBookings;

    private Integer displayOrder;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}