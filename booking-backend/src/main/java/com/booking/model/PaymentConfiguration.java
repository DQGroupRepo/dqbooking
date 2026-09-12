package com.booking.model;

import com.booking.model.enums.AdvancePaymentType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PaymentConfiguration {

    private AdvancePaymentType advancePaymentType;

    private BigDecimal advancePaymentValue;

    private Boolean payAfterConfirmation = true;

    private Boolean discussWithVendor = true;
}