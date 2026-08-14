package com.booking.dto.bundle;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BundleCalculationRequest {

    @NotEmpty(message = "At least one service is required")
    private List<String> serviceIds;
}
