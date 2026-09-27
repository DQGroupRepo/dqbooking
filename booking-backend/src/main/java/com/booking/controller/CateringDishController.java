package com.booking.controller;

import com.booking.dto.service.CateringDishResponse;
import com.booking.service.CateringDishService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catering-dishes")
@RequiredArgsConstructor
public class CateringDishController {

    private final CateringDishService cateringDishService;


    /*
     * =========================================
     * GET CATERING DISHES
     * =========================================
     */

    @GetMapping
    public ResponseEntity<List<CateringDishResponse>>
    getDishes(

            @RequestParam(
                    required = false
            )
            String cuisine,

            @RequestParam(
                    required = false
            )
            String category,

            @RequestParam(
                    required = false
            )
            String foodType

    ) {

        if (
                cuisine != null &&
                        !cuisine.isBlank() &&
                        category != null &&
                        !category.isBlank() &&
                        foodType != null &&
                        !foodType.isBlank()
        ) {

            return ResponseEntity.ok(
                    cateringDishService
                            .getByCuisineCategoryAndFoodType(
                                    cuisine,
                                    category,
                                    foodType
                            )
            );
        }


        if (
                cuisine != null &&
                        !cuisine.isBlank() &&
                        category != null &&
                        !category.isBlank()
        ) {

            return ResponseEntity.ok(
                    cateringDishService
                            .getByCuisineAndCategory(
                                    cuisine,
                                    category
                            )
            );
        }


        if (
                cuisine != null &&
                        !cuisine.isBlank()
        ) {

            return ResponseEntity.ok(
                    cateringDishService
                            .getByCuisine(
                                    cuisine
                            )
            );
        }


        return ResponseEntity.ok(
                cateringDishService
                        .getAllDishes()
        );
    }

}