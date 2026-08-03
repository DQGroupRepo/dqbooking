package com.booking.mapper.impl;

import com.booking.dto.payment.PaymentResponse;
import com.booking.mapper.PaymentMapper;
import com.booking.model.PaymentTransaction;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapperImpl
        implements PaymentMapper {

    @Override
    public PaymentResponse toResponse(
            PaymentTransaction transaction
    ) {

        return PaymentResponse.builder()

                .id(transaction.getId())

                .bookingId(transaction.getBookingId())

                .paymentReference(transaction.getPaymentReference())

                .paymentType(transaction.getPaymentType())

                .paymentMethod(transaction.getPaymentMethod())

                .paymentStatus(transaction.getPaymentStatus())

                .amount(transaction.getAmount())

                .paymentGateway(transaction.getPaymentGateway())

                .gatewayOrderId(transaction.getGatewayOrderId())

                .gatewayTransactionId(transaction.getGatewayTransactionId())

                .remarks(transaction.getRemarks())

                .paidAt(transaction.getPaidAt())

                .build();

    }

}