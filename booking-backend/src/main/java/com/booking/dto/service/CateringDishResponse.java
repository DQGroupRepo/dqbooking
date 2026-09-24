package com.booking.dto.service;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CateringDishResponse {

    private String id;

    private String name;

    private String cuisine;

    private String category;

    private String foodType;

    private boolean active;

}