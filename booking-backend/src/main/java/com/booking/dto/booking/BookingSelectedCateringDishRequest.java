package com.booking.dto.booking;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingSelectedCateringDishRequest {

    /*
     * Master CateringDish ID.
     *
     * Null for a custom dish.
     */
    private String dishId;

    /*
     * VendorCateringMenuItem ID.
     *
     * This identifies the vendor's menu item
     * that was part of the package.
     */
    private String menuItemId;

    /*
     * Snapshot of the dish name at booking time.
     */
    @NotBlank
    private String name;

    private String category;

    private String foodType;

    /*
     * True when this is a vendor-created custom dish.
     */
    private boolean custom;
}