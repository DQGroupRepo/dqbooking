package com.booking.dto.bookingslot;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class UpdateBookingSlotRequest {

    @NotBlank(message = "Slot name is required.")
    private String slotName;

    private String resourceTypeId;

    private String bookingPattern = "DAILY_RECURRING";

    @NotNull(message = "Start time is required.")
    private LocalTime startTime;

    @NotNull(message = "End time is required.")
    private LocalTime endTime;

    @NotNull(message = "Maximum bookings is required.")
    @Min(value = 1, message = "Minimum booking capacity is 1.")
    //@Max(value = 100, message = "Maximum booking capacity is 100.")
    private Integer maxBookings;

    @NotNull(message = "Display order is required.")
    @Min(value = 1)
    private Integer displayOrder;

}