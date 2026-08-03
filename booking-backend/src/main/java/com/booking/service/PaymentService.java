package com.booking.service;

import com.booking.dto.payment.CreatePaymentRequest;
import com.booking.dto.payment.PaymentResponse;

import java.util.List;

public interface PaymentService {

    PaymentResponse initiatePayment(
            CreatePaymentRequest request
    );

    PaymentResponse getPayment(
            String paymentId
    );

    List<PaymentResponse> getBookingPayments(
            String bookingId
    );

    List<PaymentResponse> getCustomerPayments();

    List<PaymentResponse> getVendorPayments();

    PaymentResponse markPaymentSuccess(
            String paymentId
    );

    PaymentResponse markPaymentFailure(
            String paymentId,
            String reason
    );
}