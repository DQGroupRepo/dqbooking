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

    private String name;

    private BigDecimal price;

    private List<String> features = new ArrayList<>();

    private boolean active;

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

}