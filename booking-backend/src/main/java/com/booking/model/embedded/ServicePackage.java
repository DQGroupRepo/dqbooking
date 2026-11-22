package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ServicePackage {

    private String id;

    /** Resource type whose physical inventory this package consumes. */
    private String resourceTypeId;

    /** Multiple inventory groups consumed by one complete package (STAY only). */
    private List<ResourceTypeRequirement> resourceRequirements = new ArrayList<>();

    /** PER_DAY, PER_NIGHT, or FIXED. */
    private String pricingBasis = "FIXED";
    private Integer minimumDuration = 1;
    private Integer maximumDuration = 31;

    /** Exact included duration for FIXED_DURATION packages (STAY uses nights). */
    private Integer includedDuration;

    /** Optional fixed appointment duration in minutes for Beauty packages. */
    private Integer durationMinutes;

    private String name;

    private BigDecimal price;

    private List<String> features = new ArrayList<>();

    private boolean active;

    /** Capacity available for overlapping day-package bookings. */
    private Integer capacity;

    /** DAY_PACKAGE or ordinary service package. */
    private String packageType;

    /**
     * Optional allow-list of slot IDs for this package.
     * Empty/null preserves legacy behavior (all active service slots).
     */
    private List<String> slotIds = new ArrayList<>();

    /** Maximum guests allowed in each room for STAY packages. Null for other categories. */
    private Integer maxGuestsPerRoom;

    /*
     * =========================================
     * CATERING PACKAGE MENU
     * =========================================
     *
     * Used only when this package belongs to
     * a catering service.
     *
     * Example:
     *
     * Vendor has 5 vegetarian dishes available
     * and customer can select any 3.
     */
    private CateringPackageMenu cateringMenu;

    /**
     * Whether a predefined booking slot is required.
     * Defaults to true to preserve existing booking behavior.
     */
    private Boolean requiresSlot = true;

}