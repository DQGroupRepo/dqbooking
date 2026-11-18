package com.booking.dto.availability;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AvailabilityOverrideResponse {

    private String id;

    private String serviceId;

    private String slotId;

    private LocalDate date;

    private Boolean blocked;

    private String reason;

    /** Canonical name consumed by the current frontend. */
    private Integer capacityOverride;

    /** Legacy response field retained for older clients. */
    private Integer maxBookingsOverride;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
