package com.booking.dto.service;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CateringMenuOptionResponse {

    /*
     * For standard dishes:
     *   id = CateringDish.id
     *
     * For custom dishes:
     *   id = VendorCateringMenuItem.id
     */
    private String id;

    /*
     * Only populated for standard
     * master-catalog dishes.
     */
    private String dishId;

    private String menuItemId;

    private String name;

    private String cuisine;

    private String category;

    private String foodType;

    private BigDecimal pricePerPerson;

    private boolean active;

    private boolean custom;

    /*
     * Indicates whether this dish is
     * currently selected in this vendor's
     * saved catering menu.
     */
    private boolean selected;
}
