package com.booking.model;

import com.booking.model.embedded.BookingPricingSnapshot;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.PaymentStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "bookings")
public class Booking extends BaseEntity {

    private String bookingNumber;
    /*
     * Groups multiple service bookings created
     * from the same cart checkout.
     *
     * Example:
     *
     * Catering
     * Decoration
     * Transport
     *
     * can all belong to the same bookingGroupId.
     */
    private String bookingGroupId;

    private String bundleId;


    /*
     * =========================================
     * RELATIONSHIP REFERENCES
     * =========================================
     */

    private String vendorId;

    private String customerId;

    private String serviceId;


    /*
     * =========================================
     * SERVICE SNAPSHOT
     * =========================================
     *
     * These values must not change if the
     * vendor later modifies the service.
     */

    private String serviceName;


    /*
     * =========================================
     * BOOKING DETAILS
     * =========================================
     */

    private LocalDate eventDate;

    private Integer guestCount;

    private BookingStatus status =
            BookingStatus.PENDING;

    private PaymentStatus paymentStatus =
            PaymentStatus.PENDING;

    private String specialRequest;

    private String eventType;


    /*
     * =========================================
     * CUSTOMER SNAPSHOT
     * =========================================
     *
     * Preserve customer information at the
     * time of booking.
     */

    private String customerName;

    private String customerPhone;

    private String customerEmail;


    /*
     * =========================================
     * VENUE SNAPSHOT
     * =========================================
     */

    private String venue;


    /*
     * =========================================
     * PRICING SNAPSHOT
     * =========================================
     *
     * This is critical.
     *
     * The booking must never depend on the
     * vendor's current pricing configuration.
     *
     * If the vendor changes pricing later,
     * this snapshot remains unchanged.
     */

    private BookingPricingSnapshot pricingSnapshot;


    /*
     * =========================================
     * PAYMENT SUMMARY
     * =========================================
     *
     * These are kept at booking level for
     * easy reporting and dashboard queries.
     */

    private BigDecimal totalAmount =
            BigDecimal.ZERO;

    private BigDecimal paidAmount =
            BigDecimal.ZERO;

    /*
     * Cancellation date.
     */
    private LocalDateTime cancelledAt;

    /*
     * Refund percentage applied.
     */
    private Integer refundPercentage;

    /*
     * Cancellation charge.
     */
    private BigDecimal cancellationCharge;

    /*
     * Refund amount.
     */
    private BigDecimal refundableAmount;

    /*
     * =========================================
     * SELECTED SERVICE PACKAGE
     * =========================================
     *
     * Snapshot reference for the package chosen
     * by the customer.
     */

    private String packageId;

    private String packageType;

}