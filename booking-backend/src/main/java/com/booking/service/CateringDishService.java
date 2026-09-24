package com.booking.service;

import com.booking.dto.service.CateringDishResponse;

import java.util.List;

public interface CateringDishService {

    List<CateringDishResponse> getAllDishes();

    List<CateringDishResponse> getByCuisine(
            String cuisine
    );

    List<CateringDishResponse> getByCuisineAndCategory(
            String cuisine,
            String category
    );

    List<CateringDishResponse> getByCuisineCategoryAndFoodType(
            String cuisine,
            String category,
            String foodType
    );

}