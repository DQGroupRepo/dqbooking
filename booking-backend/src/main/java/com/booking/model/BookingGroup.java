package com.booking.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Document(collection = "booking_groups")
public class BookingGroup extends BaseEntity {

    /*
     * =========================================
     * GROUP IDENTIFICATION
     * =========================================
     */

    private String bookingGroupId;

    private String customerId;


    /*
     * =========================================
     * BOOKING IDS
     * =========================================
     *
     * Each service in the checkout becomes
     * an individual Booking document.
     */

    private List<String> bookingIds;


    /*
     * =========================================
     * EVENT INFORMATION
     * =========================================
     */

    private String eventType;

    private String specialRequest;


    /*
     * =========================================
     * PRICING SUMMARY
     * =========================================
     *
     * These represent the complete checkout.
     */

    private BigDecimal originalTotal =
            BigDecimal.ZERO;

    private BigDecimal totalDiscount =
            BigDecimal.ZERO;

    private BigDecimal finalTotal =
            BigDecimal.ZERO;


    /*
     * =========================================
     * BUNDLE INFORMATION
     * =========================================
     */

    private boolean bundleApplied;

    private int qualifyingServiceCount;

}
