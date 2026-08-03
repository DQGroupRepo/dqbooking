package com.booking.dto.payment;

import com.booking.model.enums.PaymentMethod;
import com.booking.model.enums.PaymentStatus;
import com.booking.model.enums.PaymentType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentResponse {

    private String id;

    private String bookingId;

    private String paymentReference;

    private PaymentType paymentType;

    private PaymentMethod paymentMethod;

    private PaymentStatus paymentStatus;

    private BigDecimal amount;

    private String paymentGateway;

    private String gatewayOrderId;

    private String gatewayTransactionId;

    private String remarks;

    private LocalDateTime paidAt;

}