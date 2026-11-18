package com.booking.service;

import com.booking.dto.availability.SlotAvailabilityResponse;

import java.time.LocalDate;
import java.util.List;

public interface SlotAvailabilityService {

    /*
     * Get all active slots for a service/date
     * together with their calculated availability.
     */
    List<SlotAvailabilityResponse> getAvailability(
            String serviceId,
            LocalDate date
    );

    /*
     * Calculate availability for one slot/date.
     */
    SlotAvailabilityResponse getAvailability(
            String serviceId,
            String slotId,
            LocalDate date
    );

    /*
     * Validate that a requested number of booking
     * units can still be consumed.
     *
     * Step 4 will reuse this for temporary holds.
     */
    void validateAvailability(
            String serviceId,
            String slotId,
            LocalDate date,
            int requestedUnits
    );
}