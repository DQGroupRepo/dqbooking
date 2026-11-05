package com.booking.dto.service;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ServicePackageRequest {

    private String id;

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