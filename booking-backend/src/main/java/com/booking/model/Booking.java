package com.booking.model;

import com.booking.model.embedded.BookingPricingSnapshot;
import com.booking.model.embedded.BookingSelectedCateringDish;
import com.booking.model.embedded.BookingTimeInterval;
import com.booking.model.embedded.ResourceAllocation;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.PaymentStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    /** Inclusive start of the requested service interval (property-local time). */
    private LocalDateTime bookingFrom;

    /** Exclusive end of the requested service interval (property-local time). */
    private LocalDateTime bookingTo;

    /** Exact occupied intervals for recurring multi-day bookings. */
    private List<BookingTimeInterval> bookingIntervals = new ArrayList<>();

    /** STANDARD_SLOT, ROOM_STAY or DAY_PACKAGE. */
    private String bookingType = "STANDARD_SLOT";

    /** Deprecated legacy snapshot field; new STAY bookings leave this null. */
    private String roomTypeId;

    /** Number of rooms requested for ROOM_STAY bookings; consumes slot capacity. */
    private Integer roomQuantity;

    /*
     * =========================================
     * BOOKING SLOT SNAPSHOT
     * =========================================
     *
     * The selected slot is stored as a snapshot
     * at booking time.
     *
     * slotId identifies the original slot.
     * slotName/time values preserve what the
     * customer actually booked even if the vendor
     * later modifies the slot configuration.
     */

    private String slotId;

    /** Selected individual Beauty & Makeup menu item IDs. */
    private List<String> selectedBeautyServiceIds = new ArrayList<>();
    private List<String> selectedBeautyServiceNames = new ArrayList<>();

    /** Generic physical inventory allocation snapshot. */
    private String resourceTypeId;
    private List<String> resourceIds = new ArrayList<>();

    /** All physical allocations for combined STAY package inventory. */
    private List<ResourceAllocation> resourceAllocations = new ArrayList<>();

    private String slotName;

    private String slotStartTime;

    private String slotEndTime;

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

    /*
     * =========================================
     * SELECTED CATERING DISHES
     * =========================================
     *
     * Catering-only booking snapshot.
     *
     * Stores the exact dishes selected by the
     * customer from the selected catering package.
     *
     * These are snapshots and must not depend on
     * the vendor's current catering menu/package.
     *
     * Empty for non-catering bookings.
     */
    private List<BookingSelectedCateringDish>
            selectedCateringDishes = new ArrayList<>();

}