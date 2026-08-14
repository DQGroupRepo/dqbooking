package com.booking.dto.bundle;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CreateBundleRequest {

    @NotBlank
    private String name;

    private String description;

    @NotEmpty
    private List<String> serviceIds;

    @NotBlank
    private String discountType;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal discountValue;
}