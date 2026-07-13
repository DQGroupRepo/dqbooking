package com.booking.dto.availability;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAvailabilityOverrideRequest {

    @NotNull
    private Boolean blocked;

    private String reason;

    private Integer capacityOverride;

}
