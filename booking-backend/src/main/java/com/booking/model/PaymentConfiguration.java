package com.booking.model;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PaymentConfiguration {

    private Boolean advancePaymentAllowed = true;

    private BigDecimal advancePercentage;

    private Boolean payAfterConfirmation = true;

    private Boolean discussWithVendor = true;
}