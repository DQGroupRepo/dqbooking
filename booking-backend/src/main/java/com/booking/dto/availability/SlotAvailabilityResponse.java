package com.booking.dto.availability;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class SlotAvailabilityResponse {

    private String slotId;

    private String serviceId;

    private String slotName;

    private LocalTime startTime;

    private LocalTime endTime;

    private LocalDate date;

    /*
     * Original capacity configured on BookingSlot.
     */
    private Integer baseCapacity;

    /*
     * Capacity after applying the vendor's
     * date-specific override.
     */
    private Integer effectiveCapacity;

    /*
     * Number of bookings already consuming
     * this slot/date.
     */
    private Integer bookedCount;

    /*
     * Number of units still available.
     */
    private Integer remainingCapacity;

    private Boolean available;

    /*
     * True when vendor has completely blocked
     * the slot for this date.
     */
    private Boolean vendorBlocked;
}