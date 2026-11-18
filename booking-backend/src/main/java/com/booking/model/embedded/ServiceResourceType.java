package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Generic inventory group for a service (e.g. Big Hall, Small Hall,
 * Camera Crew A). Each unit is independently reservable.
 */
@Getter
@Setter
public class ServiceResourceType {
    private String id;
    private String name;
    private Integer quantity = 1;
    private Boolean active = true;
    private List<ServiceResourceUnit> units = new ArrayList<>();
}
