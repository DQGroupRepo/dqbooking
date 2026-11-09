package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingSelectedCateringDish {

    private String dishId;

    private String name;

    private String category;

    private String foodType;
}