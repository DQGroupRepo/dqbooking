package com.booking.model;

import com.booking.model.embedded.CancellationPolicy;
import com.booking.model.embedded.ServicePackage;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Document(collection = "vendor_service_pricing")
public class VendorServicePricing extends BaseEntity {

    /*
     * Vendor owning this pricing configuration.
     */
    private String vendorId;

    /*
     * Service to which this pricing belongs.
     */
    private String serviceId;

    /*
     * Pricing version.
     *
     * Every new pricing configuration gets
     * a new version number.
     */
    private Integer version;

    /*
     * Price applicable from this date.
     */
    private LocalDate effectiveFrom;

    /*
     * Optional expiry date.
     *
     * Null means no expiry.
     */
    private LocalDate effectiveUntil;

    /*
     * Base service price.
     */
    private BigDecimal baseAmount;

    /*
     * Configurable charges.
     */
    private List<VendorPricingHead> pricingHeads;

    /*
     * Configurable discounts.
     */
    private List<VendorDiscount> discounts;

    /*
     * Packages belonging to this pricing version.
     *
     * Packages are part of the pricing document so that
     * package definitions remain historically consistent
     * with the pricing version used for a booking.
     */
    private List<ServicePackage> packages = new ArrayList<>();

    /*
     * Payment configuration.
     */
    private PaymentConfiguration paymentConfiguration;

    /*
     * Cancellation policy configured by the vendor.
     */
    private CancellationPolicy cancellationPolicy =
            new CancellationPolicy();

    /*
     * =========================================
     * PRICING AUDIT
     * =========================================
     */

    private Instant createdAt;

    private String createdBy;
}