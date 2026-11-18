package com.booking.dto.booking;

import com.booking.dto.pricing.BookingPricingResponse;
import com.booking.model.BaseEntity;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Getter
@Builder
public class BookingResponse extends BaseEntity {

    private String id;

    private String bookingGroupId;

    private String bookingNumber;


    /*
     * =========================================
     * SERVICE INFORMATION
     * =========================================
     *
     * serviceName is a booking snapshot.
     *
     * serviceImage and serviceCategory are
     * enriched from VendorService when required
     * for UI display.
     */

    private String serviceName;

    private String serviceImage;

    private String serviceCategory;


    /*
     * =========================================
     * BOOKING AMOUNT
     * =========================================
     */

    private BigDecimal totalAmount;

    private LocalDateTime bookingFrom;

    private LocalDateTime bookingTo;

    /** Backward-compatible calendar date for non-STAY categories. */
    private LocalDate eventDate;

    private String bookingType;

    private String slotId;

    private String slotName;

    private String slotStartTime;

    private String slotEndTime;

    private Integer roomQuantity;

    private String resourceTypeName;

    private java.util.List<String> resourceIds;

    private java.util.List<String> resourceNames;

    private Integer guestCount;

    private BookingStatus status;

    private PaymentStatus paymentStatus;

    private String specialRequest;

    private String eventType;


    /*
     * =========================================
     * CUSTOMER
     * =========================================
     */

    private String customerName;

    private String customerPhone;

    private String customerEmail;


    /*
     * =========================================
     * VENUE
     * =========================================
     */

    private String venue;


    /*
     * =========================================
     * PAYMENT
     * =========================================
     */

    private BigDecimal paidAmount;


    /*
     * =========================================
     * PRICING SNAPSHOT
     * =========================================
     */

    private BookingPricingResponse pricing;


    /*
     * =========================================
     * CANCELLATION
     * =========================================
     */

    private boolean cancellable;

    private LocalDateTime cancelledAt;

    private Integer refundPercentage;

    private BigDecimal cancellationCharge;

    private BigDecimal refundableAmount;


    /*
     * =========================================
     * PACKAGE
     * =========================================
     */

    private String packageId;

    private String packageType;

}