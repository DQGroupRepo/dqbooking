package com.booking.service.impl;

import com.booking.dto.service.CateringDishResponse;
import com.booking.model.CateringDish;
import com.booking.repository.CateringDishRepository;
import com.booking.service.CateringDishService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CateringDishServiceImpl
        implements CateringDishService {

    private final CateringDishRepository
            cateringDishRepository;


    /*
     * =========================================
     * GET ALL ACTIVE DISHES
     * =========================================
     */

    @Override
    @Transactional(readOnly = true)
    public List<CateringDishResponse> getAllDishes() {

        return cateringDishRepository
                .findByActiveTrueAndDeletedFalse()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    /*
     * =========================================
     * GET BY CUISINE
     * =========================================
     */

    @Override
    @Transactional(readOnly = true)
    public List<CateringDishResponse> getByCuisine(
            String cuisine
    ) {

        return cateringDishRepository
                .findByCuisineAndActiveTrueAndDeletedFalse(
                        cuisine
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }


    /*
     * =========================================
     * GET BY CUISINE + CATEGORY
     * =========================================
     */

    @Override
    @Transactional(readOnly = true)
    public List<CateringDishResponse>
    getByCuisineAndCategory(
            String cuisine,
            String category
    ) {

        return cateringDishRepository
                .findByCuisineAndCategoryAndActiveTrueAndDeletedFalse(
                        cuisine,
                        category
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }


    /*
     * =========================================
     * GET BY CUISINE + CATEGORY + FOOD TYPE
     * =========================================
     */

    @Override
    @Transactional(readOnly = true)
    public List<CateringDishResponse>
    getByCuisineCategoryAndFoodType(
            String cuisine,
            String category,
            String foodType
    ) {

        return cateringDishRepository
                .findByCuisineAndCategoryAndFoodTypeAndActiveTrueAndDeletedFalse(
                        cuisine,
                        category,
                        foodType
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }


    /*
     * =========================================
     * MAP RESPONSE
     * =========================================
     */

    private CateringDishResponse toResponse(
            CateringDish dish
    ) {

        CateringDishResponse response =
                new CateringDishResponse();

        response.setId(
                dish.getId()
        );

        response.setName(
                dish.getName()
        );

        response.setCuisine(
                dish.getCuisine()
        );

        response.setCategory(
                dish.getCategory()
        );

        response.setFoodType(
                dish.getFoodType()
        );

        response.setActive(
                Boolean.TRUE.equals(
                        dish.getActive()
                )
        );

        return response;
    }

}