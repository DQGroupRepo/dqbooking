package com.booking.dto.service;

import com.booking.model.embedded.ResourceTypeRequirement;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ServicePackageResponse {

    private String id;

    /** Legacy single-type mapping retained for older clients and saved packages. */
    private String resourceTypeId;

    private List<ResourceTypeRequirement> resourceRequirements;

    /** PER_DAY, PER_NIGHT, or FIXED. */
    private String pricingBasis = "FIXED";

    /** Minimum customer-selected days/nights. */
    private Integer minimumDuration = 1;

    /** Maximum customer-selected days/nights. */
    private Integer maximumDuration = 31;

    private Integer includedDuration;

    private Integer durationMinutes;

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