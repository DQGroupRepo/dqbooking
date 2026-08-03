package com.booking.dto.pricing;

import com.booking.model.enums.PricingCalculationType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class VendorPricingHeadRequest {

    @NotBlank(message = "Pricing head code is required.")
    private String code;

    @NotBlank(message = "Pricing head name is required.")
    private String name;

    @NotNull(message = "Calculation type is required.")
    private PricingCalculationType calculationType;

    @NotNull(message = "Pricing value is required.")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Pricing value cannot be negative."
    )
    private BigDecimal value;

    @NotNull(message = "Display order is required.")
    private Integer displayOrder;

    private Boolean active = true;
}