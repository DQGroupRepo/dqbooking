package com.booking.dto.pricing;

import com.booking.model.enums.AdvancePaymentType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class PaymentConfigurationResponse {

    private AdvancePaymentType advancePaymentType;

    private BigDecimal advancePaymentValue;

    private Boolean payAfterConfirmation;

    private Boolean discussWithVendor;
}