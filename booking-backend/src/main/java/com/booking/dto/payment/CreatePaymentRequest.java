package com.booking.dto.payment;

import com.booking.model.enums.PaymentMethod;
import com.booking.model.enums.PaymentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreatePaymentRequest {

    @NotBlank
    private String bookingId;

    @NotNull
    private PaymentType paymentType;

    @NotNull
    private PaymentMethod paymentMethod;

    @NotNull
    private BigDecimal amount;

    private String remarks;

}