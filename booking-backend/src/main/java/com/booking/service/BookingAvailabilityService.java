package com.booking.service;

import com.booking.dto.availability.BookingHoldResponse;
import com.booking.dto.availability.CreateBookingHoldRequest;
import com.booking.dto.availability.SlotAvailabilityResponse;

import java.time.LocalDate;
import java.util.List;

public interface BookingAvailabilityService {

    /*
     * Get availability for every slot belonging
     * to a service on a particular date.
     */
    List<SlotAvailabilityResponse> getSlotAvailability(
            String serviceId,
            LocalDate date
    );


    List<SlotAvailabilityResponse> getSlotAvailability(
            String serviceId,
            LocalDate date,
            String resourceTypeId
    );


    /*
     * Get availability for one particular slot.
     */
    SlotAvailabilityResponse getSlotAvailability(
            String serviceId,
            String slotId,
            LocalDate date
    );

    BookingHoldResponse holdSlot(
            CreateBookingHoldRequest request
    );

    void releaseHold(
            String serviceId,
            String holdId
    );
}