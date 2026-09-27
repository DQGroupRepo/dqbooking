package com.booking.repository;

import com.booking.model.CateringDish;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CateringDishRepository
        extends MongoRepository<CateringDish, String> {

    List<CateringDish> findByActiveTrueAndDeletedFalse();

    List<CateringDish>
    findByCuisineAndActiveTrueAndDeletedFalse(
            String cuisine
    );

    List<CateringDish>
    findByCuisineAndCategoryAndActiveTrueAndDeletedFalse(
            String cuisine,
            String category
    );

    List<CateringDish>
    findByCuisineAndCategoryAndFoodTypeAndActiveTrueAndDeletedFalse(
            String cuisine,
            String category,
            String foodType
    );

}