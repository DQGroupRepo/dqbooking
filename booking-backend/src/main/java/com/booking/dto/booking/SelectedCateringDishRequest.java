package com.booking.dto.booking;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SelectedCateringDishRequest {

    /*
     * ID of the dish from the catering package menu.
     */
    @NotBlank
    private String dishId;

    /*
     * Display name captured at booking time.
     *
     * This is useful as part of the booking snapshot so
     * future changes to the vendor menu do not alter
     * the historical booking.
     */
    @NotBlank
    private String name;

    /*
     * Category:
     * Vegetarian
     * Non-Vegetarian
     * Soups
     * Desserts
     */
    @NotBlank
    private String category;

    @NotBlank
    private String foodType;
}