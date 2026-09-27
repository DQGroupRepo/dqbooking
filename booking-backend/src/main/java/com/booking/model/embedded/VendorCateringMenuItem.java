package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class VendorCateringMenuItem {

    private String id;

    private String dishId;

    private String customName;

    private String cuisine;

    private String category;

    private String foodType;

    private BigDecimal pricePerPerson;

    private boolean active = true;

}