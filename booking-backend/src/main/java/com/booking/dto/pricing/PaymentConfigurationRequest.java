package com.booking.dto.pricing;

import com.booking.model.enums.AdvancePaymentType;
import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PaymentConfigurationRequest {

    private AdvancePaymentType advancePaymentType;

    @DecimalMin(
            value = "0.0",
            inclusive = true
    )
    private BigDecimal advancePaymentValue;

    private Boolean payAfterConfirmation = true;

    private Boolean discussWithVendor = true;
}