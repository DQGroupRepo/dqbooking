package com.booking.dto.service;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ServicePackageResponse {

    private String id;

    private String resourceTypeId;

    /** PER_DAY, PER_NIGHT, or FIXED. */
    private String pricingBasis = "FIXED";

    /** Minimum customer-selected days/nights. */
    private Integer minimumDuration = 1;

    /** Maximum customer-selected days/nights. */
    private Integer maximumDuration = 31;

    private Integer includedDuration;

    private String name;

    private BigDecimal price;

    private List<String> features;

    private boolean active;

    private Integer capacity;

    private String packageType;

    private boolean requiresSlot = true;

    private List<String> slotIds;

    private Integer maxGuestsPerRoom;

    /*
     * Catering-only configuration.
     */
    private CateringPackageMenuResponse cateringMenu;
}