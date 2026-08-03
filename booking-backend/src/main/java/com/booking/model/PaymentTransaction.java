package com.booking.model;

import com.booking.model.enums.PaymentMethod;
import com.booking.model.enums.PaymentStatus;
import com.booking.model.enums.PaymentType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "payment_transactions")
public class PaymentTransaction extends BaseEntity {

    /*
     * Booking Reference
     */
    private String bookingId;

    /*
     * Customer Reference
     */
    private String customerId;

    /*
     * Vendor Reference
     */
    private String vendorId;

    /*
     * ADVANCE
     * BALANCE
     * FULL
     * REFUND
     */
    private PaymentType paymentType;

    /*
     * Amount attempted
     */
    private BigDecimal amount;

    /*
     * SUCCESS
     * FAILED
     * PENDING
     * REFUNDED
     */
    private PaymentStatus paymentStatus;

    /*
     * CARD
     * UPI
     * NETBANKING
     * CASH
     * WALLET
     */
    private PaymentMethod paymentMethod;

    /*
     * Razorpay / Stripe / Cash
     */
    private String paymentGateway;

    /*
     * Gateway generated Order Id
     */
    private String gatewayOrderId;

    /*
     * Gateway Transaction Id
     */
    private String gatewayTransactionId;

    /*
     * Internal Reference
     */
    private String paymentReference;

    /*
     * Optional gateway payload
     */
    private String gatewayResponse;

    /*
     * Failure reason
     */
    private String failureReason;

    /*
     * Paid timestamp
     */
    private LocalDateTime paidAt;

    private String remarks;

    private String internalRemarks;

    private String currency = "INR";

    private Integer attemptNo = 1;

    private String refundReference;
}