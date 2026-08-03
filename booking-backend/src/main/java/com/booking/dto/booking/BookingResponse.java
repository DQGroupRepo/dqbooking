package com.booking.dto.booking;

import com.booking.dto.pricing.BookingPricingResponse;
import com.booking.model.BaseEntity;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class BookingResponse extends BaseEntity {

    private String id;

    private String bookingNumber;

    private String serviceName;

    private BigDecimal totalAmount;

    private LocalDate eventDate;

    private Integer guestCount;

    private BookingStatus status;

    private PaymentStatus paymentStatus;

    private String specialRequest;

    private String eventType;

    private String customerName;

    private String customerPhone;

    private String customerEmail;

    private String venue;

    private BigDecimal paidAmount;

    /*
     * Locked pricing snapshot.
     *
     * This represents the pricing that was applicable
     * when this booking was created.
     */
    private BookingPricingResponse pricing;

    private boolean cancellable;
}