package com.booking.dto.pricing;

import com.booking.model.enums.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class VendorDiscountRequest {

    @NotBlank(message = "Discount name is required.")
    private String name;

    @NotNull(message = "Discount type is required.")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required.")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Discount value cannot be negative."
    )
    private BigDecimal value;

    private LocalDate validFrom;

    private LocalDate validUntil;

    private Boolean active = true;
}