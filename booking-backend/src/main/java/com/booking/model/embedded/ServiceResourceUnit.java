package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;

/** Stable identity for one physical unit within a resource type. */
@Getter
@Setter
public class ServiceResourceUnit {
    private String id;
    private String name;
    private Boolean active = true;
}
