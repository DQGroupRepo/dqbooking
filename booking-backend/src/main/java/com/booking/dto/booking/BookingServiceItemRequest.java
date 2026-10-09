package com.booking.dto.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
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

    @NotBlank
    private String slotId;

    private String packageId;

    @NotNull
    @Future
    private LocalDate eventDate;

    @NotNull
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