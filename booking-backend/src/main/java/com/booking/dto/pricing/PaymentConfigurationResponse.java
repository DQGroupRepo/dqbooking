package com.booking.dto.pricing;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class PaymentConfigurationResponse {

    private Boolean advancePaymentAllowed;

    private BigDecimal advancePercentage;

    private Boolean payAfterConfirmation;

    private Boolean discussWithVendor;
}