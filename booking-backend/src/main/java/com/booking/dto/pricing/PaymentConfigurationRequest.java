package com.booking.dto.pricing;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PaymentConfigurationRequest {

    private Boolean advancePaymentAllowed = true;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private BigDecimal advancePercentage;

    private Boolean payAfterConfirmation = true;

    private Boolean discussWithVendor = true;
}