package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CateringPackageDish {
    private String id;
    private String menuItemId;
    private String dishId;
    private String name;
    private String category;
    private String foodType;
    private boolean custom;
}
