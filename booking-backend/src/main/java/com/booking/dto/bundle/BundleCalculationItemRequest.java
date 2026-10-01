package com.booking.dto.bundle;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BundleCalculationItemRequest {

    @NotBlank
    private String serviceId;

    private LocalDate eventDate;

    private String packageId;

}