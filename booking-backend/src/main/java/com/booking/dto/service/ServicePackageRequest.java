package com.booking.dto.service;

import com.booking.model.enums.ServicePackageType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ServicePackageRequest {

    @NotNull
    private ServicePackageType type;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal price;

    private List<String> features;

    private List<ServicePackageRequest> packages;
}