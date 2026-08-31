package com.booking.dto.booking;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BookingServiceItemRequest {

    @NotBlank
    private String serviceId;

    private String packageId;

    @NotNull
    @Future
    private LocalDate eventDate;

    @NotNull
    @Min(1)
    private Integer guestCount;
}