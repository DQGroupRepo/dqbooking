package com.booking.service.impl;

import com.booking.dto.payment.CreatePaymentRequest;
import com.booking.dto.payment.PaymentResponse;
import com.booking.mapper.PaymentMapper;
import com.booking.model.Booking;
import com.booking.model.PaymentTransaction;
import com.booking.model.User;
import com.booking.model.enums.PaymentStatus;
import com.booking.repository.BookingRepository;
import com.booking.repository.PaymentTransactionRepository;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl
        implements PaymentService {

    private final PaymentTransactionRepository
            paymentTransactionRepository;

    private final BookingRepository
            bookingRepository;

    private final AuthenticatedUserService
            authenticatedUserService;

    private final PaymentMapper
            paymentMapper;

    @Override
    public PaymentResponse initiatePayment(
            CreatePaymentRequest request
    ) {

        User customer =
                authenticatedUserService
                        .getCurrentCustomer();

        log.info("Initiating payment customerId={} bookingId={}",
                customer.getId(), request.getBookingId());

        Booking booking =
                bookingRepository
                        .findById(request.getBookingId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Booking not found."
                                )
                        );

        PaymentTransaction transaction =
                new PaymentTransaction();

        transaction.setBookingId(booking.getId());
        transaction.setCustomerId(customer.getId());
        transaction.setVendorId(booking.getVendorId());
        transaction.setPaymentType(request.getPaymentType());
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setAmount(request.getAmount());
        transaction.setRemarks(request.getRemarks());
        transaction.setPaymentStatus(PaymentStatus.PENDING);
        transaction.setPaymentReference(UUID.randomUUID().toString());
        transaction.setPaidAt(LocalDateTime.now());

        transaction =
                paymentTransactionRepository
                        .save(transaction);

        log.info("Payment initiated paymentId={} bookingId={} customerId={} vendorId={} status={}",
                transaction.getId(),
                transaction.getBookingId(),
                transaction.getCustomerId(),
                transaction.getVendorId(),
                transaction.getPaymentStatus());

        return paymentMapper.toResponse(transaction);
    }

    @Override
    public PaymentResponse getPayment(
            String paymentId
    ) {

        PaymentTransaction payment =
                paymentTransactionRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Payment not found."
                                )
                        );

        log.debug("Retrieved payment paymentId={} status={}",
                paymentId, payment.getPaymentStatus());

        return paymentMapper.toResponse(payment);
    }

    @Override
    public List<PaymentResponse> getBookingPayments(
            String bookingId
    ) {

        List<PaymentResponse> payments =
                paymentTransactionRepository
                        .findByBookingId(bookingId)
                        .stream()
                        .map(paymentMapper::toResponse)
                        .toList();

        log.info("Retrieved booking payments bookingId={} paymentCount={}",
                bookingId, payments.size());

        return payments;
    }

    @Override
    public List<PaymentResponse> getCustomerPayments() {

        String customerId =
                authenticatedUserService
                        .getCurrentCustomer()
                        .getId();

        List<PaymentResponse> payments =
                paymentTransactionRepository
                        .findByCustomerId(customerId)
                        .stream()
                        .map(paymentMapper::toResponse)
                        .toList();

        log.info("Retrieved customer payments customerId={} paymentCount={}",
                customerId, payments.size());

        return payments;
    }

    @Override
    public List<PaymentResponse> getVendorPayments() {

        User vendor =
                authenticatedUserService
                        .getCurrentVendor();

        List<PaymentResponse> payments =
                paymentTransactionRepository
                        .findByVendorId(vendor.getId())
                        .stream()
                        .map(paymentMapper::toResponse)
                        .toList();

        log.info("Retrieved vendor payments vendorId={} paymentCount={}",
                vendor.getId(), payments.size());

        return payments;
    }

    @Override
    public PaymentResponse markPaymentSuccess(
            String paymentId
    ) {

        log.info("Marking payment as successful paymentId={}",
                paymentId);

        PaymentTransaction transaction =
                paymentTransactionRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Payment not found."
                                )
                        );

        transaction.setPaymentStatus(PaymentStatus.SUCCESS);
        transaction.setPaidAt(LocalDateTime.now());

        transaction =
                paymentTransactionRepository.save(transaction);

        Booking booking =
                bookingRepository
                        .findById(transaction.getBookingId())
                        .orElseThrow();

        booking.setPaidAmount(
                booking.getPaidAmount()
                        .add(transaction.getAmount())
        );

        booking.getPricingSnapshot()
                .setPaidAmount(
                        booking.getPaidAmount()
                );

        if (
                booking.getPaidAmount()
                        .compareTo(
                                booking.getTotalAmount()
                        ) >= 0
        ) {

            booking.setPaymentStatus(
                    PaymentStatus.SUCCESS
            );
        }

        bookingRepository.save(booking);

        log.info("Payment marked successful paymentId={} bookingId={} bookingPaymentStatus={}",
                transaction.getId(),
                transaction.getBookingId(),
                booking.getPaymentStatus());

        return paymentMapper.toResponse(transaction);
    }

    @Override
    public PaymentResponse markPaymentFailure(
            String paymentId,
            String reason
    ) {

        log.warn("Marking payment as failed paymentId={}", paymentId);

        PaymentTransaction transaction =
                paymentTransactionRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Payment not found."
                                )
                        );

        transaction.setPaymentStatus(PaymentStatus.FAILED);
        transaction.setFailureReason(reason);

        transaction =
                paymentTransactionRepository.save(transaction);

        log.info("Payment marked failed paymentId={} status={}",
                transaction.getId(), transaction.getPaymentStatus());

        return paymentMapper.toResponse(transaction);
    }

}
