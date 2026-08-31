package com.booking.dto.bundle;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BundleCalculationItemRequest {

    @NotBlank
    private String serviceId;

    private String packageId;

}