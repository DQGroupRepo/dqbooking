package com.booking.mapper.impl;

import com.booking.dto.service.CateringDetailsRequest;
import com.booking.dto.service.CateringDetailsResponse;
import com.booking.mapper.CateringDetailsMapper;
import com.booking.model.embedded.CateringDetails;
import org.springframework.stereotype.Component;

@Component
public class CateringDetailsMapperImpl
        implements CateringDetailsMapper {

    @Override
    public CateringDetails toEntity(
            CateringDetailsRequest request) {

        if (request == null) {
            return null;
        }

        CateringDetails details = new CateringDetails();

        details.setVegetarian(
                request.isVegetarian()
        );

        details.setNonVegetarian(
                request.isNonVegetarian()
        );

        details.setCuisines(
                request.getCuisines()
        );

        details.setProvidesCateringStaff(
                request.isProvidesCateringStaff()
        );

        details.setStaffCostPerPerson(
                request.getStaffCostPerPerson()
        );

        details.setMaximumServiceDistanceKm(
                request.getMaximumServiceDistanceKm()
        );

        return details;
    }

    @Override
    public CateringDetailsResponse toResponse(
            CateringDetails entity) {

        if (entity == null) {
            return null;
        }

        CateringDetailsResponse response =
                new CateringDetailsResponse();

        response.setVegetarian(
                entity.isVegetarian()
        );

        response.setNonVegetarian(
                entity.isNonVegetarian()
        );

        response.setCuisines(
                entity.getCuisines()
        );

        response.setProvidesCateringStaff(
                entity.isProvidesCateringStaff()
        );

        response.setStaffCostPerPerson(
                entity.getStaffCostPerPerson()
        );

        response.setMaximumServiceDistanceKm(
                entity.getMaximumServiceDistanceKm()
        );

        return response;
    }
}