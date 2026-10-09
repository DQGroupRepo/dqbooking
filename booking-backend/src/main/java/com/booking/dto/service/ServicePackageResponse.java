package com.booking.dto.service;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ServicePackageResponse {

    private String id;

    private String name;

    private BigDecimal price;

    private List<String> features;

    private boolean active;

    /*
     * Catering-only configuration.
     */
    private CateringPackageMenuResponse cateringMenu;
}