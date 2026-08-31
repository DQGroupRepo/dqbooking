package com.booking.dto.bundle;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BundleCalculationRequest {

    @NotBlank
    private String bundleId;

    @NotEmpty
    @Valid
    private List<BundleCalculationItemRequest> items;

}