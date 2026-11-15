package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;

/** Inventory composition consumed by one complete package. */
@Getter
@Setter
public class ResourceTypeRequirement {
    private String resourceTypeId;
    private Integer quantity = 1;
}
