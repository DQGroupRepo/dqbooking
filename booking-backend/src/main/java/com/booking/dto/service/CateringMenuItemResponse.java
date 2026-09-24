package com.booking.dto.service;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CateringMenuItemResponse {

    private String id;

    private String dishId;

    private String name;

    private String cuisine;

    private String category;

    private String foodType;

    private BigDecimal pricePerPerson;

    private boolean active;

    private boolean custom;

}