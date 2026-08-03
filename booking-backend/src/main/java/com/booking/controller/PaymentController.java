package com.booking.controller;

import com.booking.dto.payment.CreatePaymentRequest;
import com.booking.dto.payment.PaymentResponse;
import com.booking.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public PaymentResponse initiatePayment(
            @Valid @RequestBody CreatePaymentRequest request
    ) {

        return paymentService.initiatePayment(request);

    }

    @GetMapping("/{paymentId}")
    public PaymentResponse getPayment(
            @PathVariable String paymentId
    ) {

        return paymentService.getPayment(paymentId);

    }

    @GetMapping("/booking/{bookingId}")
    public List<PaymentResponse> getBookingPayments(
            @PathVariable String bookingId
    ) {

        return paymentService.getBookingPayments(bookingId);

    }

    @GetMapping("/customer")
    public List<PaymentResponse> getCustomerPayments() {

        return paymentService.getCustomerPayments();

    }

    @GetMapping("/vendor")
    public List<PaymentResponse> getVendorPayments() {

        return paymentService.getVendorPayments();

    }

    @PostMapping("/{paymentId}/success")
    public PaymentResponse markPaymentSuccess(
            @PathVariable String paymentId
    ) {

        return paymentService.markPaymentSuccess(paymentId);

    }

    @PostMapping("/{paymentId}/failure")
    public PaymentResponse markPaymentFailure(
            @PathVariable String paymentId,
            @RequestParam String reason
    ) {

        return paymentService.markPaymentFailure(
                paymentId,
                reason
        );

    }

}