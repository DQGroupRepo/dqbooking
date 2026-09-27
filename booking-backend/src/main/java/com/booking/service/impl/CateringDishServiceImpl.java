package com.booking.service.impl;

import com.booking.dto.service.CateringDishResponse;
import com.booking.model.CateringDish;
import com.booking.repository.CateringDishRepository;
import com.booking.service.CateringDishService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CateringDishServiceImpl
        implements CateringDishService {

    private static final Logger log =
            LoggerFactory.getLogger(CateringDishServiceImpl.class);

    private final CateringDishRepository cateringDishRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CateringDishResponse> getAllDishes() {

        log.debug(
                "Fetching all active catering dishes"
        );

        List<CateringDishResponse> responses =
                cateringDishRepository
                        .findByActiveTrueAndDeletedFalse()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        log.info(
                "Active catering dishes fetched count={}",
                responses.size()
        );

        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CateringDishResponse> getByCuisine(
            String cuisine
    ) {

        log.debug(
                "Fetching catering dishes by cuisine cuisine={}",
                cuisine
        );

        List<CateringDishResponse> responses =
                cateringDishRepository
                        .findByCuisineAndActiveTrueAndDeletedFalse(
                                cuisine
                        )
                        .stream()
                        .map(this::toResponse)
                        .toList();

        log.info(
                "Catering dishes fetched by cuisine cuisine={} count={}",
                cuisine,
                responses.size()
        );

        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CateringDishResponse>
    getByCuisineAndCategory(
            String cuisine,
            String category
    ) {

        log.debug(
                "Fetching catering dishes cuisine={} category={}",
                cuisine,
                category
        );

        List<CateringDishResponse> responses =
                cateringDishRepository
                        .findByCuisineAndCategoryAndActiveTrueAndDeletedFalse(
                                cuisine,
                                category
                        )
                        .stream()
                        .map(this::toResponse)
                        .toList();

        log.info(
                "Catering dishes fetched cuisine={} category={} count={}",
                cuisine,
                category,
                responses.size()
        );

        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CateringDishResponse>
    getByCuisineCategoryAndFoodType(
            String cuisine,
            String category,
            String foodType
    ) {

        log.debug(
                "Fetching catering dishes cuisine={} category={} foodType={}",
                cuisine,
                category,
                foodType
        );

        List<CateringDishResponse> responses =
                cateringDishRepository
                        .findByCuisineAndCategoryAndFoodTypeAndActiveTrueAndDeletedFalse(
                                cuisine,
                                category,
                                foodType
                        )
                        .stream()
                        .map(this::toResponse)
                        .toList();

        log.info(
                "Catering dishes fetched cuisine={} category={} foodType={} count={}",
                cuisine,
                category,
                foodType,
                responses.size()
        );

        return responses;
    }

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