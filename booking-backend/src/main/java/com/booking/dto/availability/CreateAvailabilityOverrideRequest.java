package com.booking.dto.availability;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateAvailabilityOverrideRequest {

    /** Set for a slot-level override. */
    private String slotId;

    /** Deprecated compatibility field; room-type overrides are no longer supported. */
    private String roomTypeId;

    @NotNull
    @FutureOrPresent
    private LocalDate date;

    @NotNull
    private Boolean blocked;

    private String reason;

    private Integer capacityOverride;

}
