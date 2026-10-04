package com.booking.dto.availability;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateBookingHoldRequest {

    @NotBlank
    private String serviceId;

    @NotBlank
    private String slotId;

    @NotNull
    @Future
    private LocalDate eventDate;

    @NotNull
    @Min(1)
    private Integer quantity = 1;

    /*
     * Identifies the customer's cart/hold.
     *
     * The same customer/cart can subsequently
     * release or convert the hold.
     */
    @NotBlank
    private String cartId;
}