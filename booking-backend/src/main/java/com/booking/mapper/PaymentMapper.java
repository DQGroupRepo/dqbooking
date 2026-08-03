package com.booking.mapper;

import com.booking.dto.payment.PaymentResponse;
import com.booking.model.PaymentTransaction;

public interface PaymentMapper {

    PaymentResponse toResponse(
            PaymentTransaction transaction
    );

}