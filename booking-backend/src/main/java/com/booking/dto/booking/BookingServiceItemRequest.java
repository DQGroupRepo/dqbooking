package com.booking.dto.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class BookingServiceItemRequest {

    @NotBlank
    private String serviceId;

    /*
     * =========================================
     * BOOKING SLOT
     * =========================================
     */

    /** Selected booking slot; required for STAY and all slot-based bookings. */
    private String slotId;

    /** Exact temporary hold to convert during checkout. */
    private String holdId;

    private String packageId;

    @NotNull
    private LocalDateTime bookingFrom;

    @NotNull
    private LocalDateTime bookingTo;

    /** STANDARD_SLOT, ROOM_STAY or DAY_PACKAGE. */
    private String bookingType = "STANDARD_SLOT";

    /** Number of rooms requested; defaults to one. */
    @Min(1)
    private Integer roomQuantity = 1;

    /** Optional for STAY bookings because the customer selects rooms, not a guest count. */
    @Min(1)
    private Integer guestCount;

    /*
     * =========================================
     * CATERING PACKAGE DISHES
     * =========================================
     *
     * Only populated when the selected package
     * belongs to a catering service.
     *
     * Empty for all other services.
     */
    @Valid
    private List<BookingSelectedCateringDishRequest>
            selectedCateringDishes = new ArrayList<>();
}