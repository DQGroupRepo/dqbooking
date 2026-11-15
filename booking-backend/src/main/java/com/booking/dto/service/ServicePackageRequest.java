package com.booking.dto.service;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import com.booking.model.embedded.ResourceTypeRequirement;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ServicePackageRequest {

    private String id;

    private String resourceTypeId;

    /** Required resource-type composition for combined STAY packages. */
    private List<ResourceTypeRequirement> resourceRequirements = new ArrayList<>();

    /** PER_DAY, PER_NIGHT, or FIXED. */
    private String pricingBasis = "FIXED";

    /** Minimum customer-selected days/nights. */
    @Min(1) @Max(31)
    private Integer minimumDuration = 1;

    /** Maximum customer-selected days/nights. */
    @Min(1) @Max(31)
    private Integer maximumDuration = 31;

    /** Exact included duration for FIXED_DURATION packages. */
    @Min(1) @Max(31)
    private Integer includedDuration;

    private String name;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal price;

    private List<String> features = new ArrayList<>();

    private boolean active;

    /** Required for capacity-limited DAY_PACKAGE inventory. */
    private Integer capacity;

    /** DAY_PACKAGE or ordinary service package. */
    private String packageType;

    /** Defaults to true to preserve existing slot-based package behavior. */
    private boolean requiresSlot = true;

    /** Optional slot allow-list; empty means all active slots for compatibility. */
    private List<String> slotIds = new ArrayList<>();

    /** Maximum guests allowed per room for STAY packages. Required for active STAY packages. */
    private Integer maxGuestsPerRoom;

    /*
     * Catering-only configuration.
     */
    @Valid
    private CateringPackageMenuRequest cateringPackageMenu;
}