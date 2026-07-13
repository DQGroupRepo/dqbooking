package com.booking.dto.availability;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateAvailabilityOverrideRequest {

    @NotBlank
    private String slotId;

    @NotNull
    @FutureOrPresent
    private LocalDate date;

    @NotNull
    private Boolean blocked;

    private String reason;

    private Integer capacityOverride;

}
