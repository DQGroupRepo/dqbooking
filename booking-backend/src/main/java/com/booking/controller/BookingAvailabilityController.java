package com.booking.controller;

import com.booking.dto.availability.BookingHoldResponse;
import com.booking.dto.availability.CreateBookingHoldRequest;
import com.booking.dto.availability.SlotAvailabilityResponse;
import com.booking.service.BookingAvailabilityService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/services/{serviceId}/availability")
@RequiredArgsConstructor
@Validated
public class BookingAvailabilityController {

    private final BookingAvailabilityService
            bookingAvailabilityService;


    /*
     * =========================================
     * GET ALL SLOT AVAILABILITY FOR DATE
     * =========================================
     *
     * Example:
     *
     * GET
     * /api/services/{serviceId}/availability?date=2026-10-10
     */

    @GetMapping
    public List<SlotAvailabilityResponse> getAvailability(
            @PathVariable String serviceId,

            @RequestParam
            @NotNull
            @FutureOrPresent
            LocalDate date,

            @RequestParam(required = false)
            String resourceTypeId
    ) {

        return bookingAvailabilityService
                .getSlotAvailability(
                        serviceId,
                        date,
                        resourceTypeId
                );
    }


    /*
     * =========================================
     * GET ONE SLOT AVAILABILITY
     * =========================================
     *
     * Example:
     *
     * GET
     * /api/services/{serviceId}/availability/{slotId}
     *     ?date=2026-10-10
     */

    @GetMapping("/{slotId}")
    public SlotAvailabilityResponse getSlotAvailability(
            @PathVariable String serviceId,

            @PathVariable String slotId,

            @RequestParam
            @NotNull
            @FutureOrPresent
            LocalDate date
    ) {

        return bookingAvailabilityService
                .getSlotAvailability(
                        serviceId,
                        slotId,
                        date
                );
    }

    @PostMapping("/hold")
    public BookingHoldResponse holdSlot(
            @Valid @RequestBody CreateBookingHoldRequest request
    ) {
        return bookingAvailabilityService.holdSlot(request);
    }

    /*
     * Release a customer's active temporary hold.
     * The service verifies ownership before changing it.
     */
    @DeleteMapping("/hold/{holdId}")
    public void releaseHold(
            @PathVariable String serviceId,
            @PathVariable String holdId
    ) {
        bookingAvailabilityService.releaseHold(serviceId, holdId);
    }
}