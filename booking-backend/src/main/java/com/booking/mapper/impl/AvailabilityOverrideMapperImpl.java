/*
package com.booking.mapper.impl;

import com.booking.dto.availability.AvailabilityOverrideResponse;
import com.booking.dto.availability.CreateAvailabilityOverrideRequest;
import com.booking.dto.availability.UpdateAvailabilityOverrideRequest;
import com.booking.mapper.AvailabilityOverrideMapper;
import com.booking.model.AvailabilityOverride;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AvailabilityOverrideMapperImpl
        implements AvailabilityOverrideMapper {

    @Override
    public AvailabilityOverride toEntity(
            CreateAvailabilityOverrideRequest request) {

        AvailabilityOverride entity =
                new AvailabilityOverride();

        entity.setSlotId(request.getSlotId());
        entity.setDate(request.getDate());
        entity.setBlocked(request.getBlocked());
        entity.setReason(request.getReason());
        entity.setCapacityOverride(
                request.getCapacityOverride());

        return entity;
    }

    @Override
    public AvailabilityOverrideResponse toResponse(
            AvailabilityOverride entity) {

        return AvailabilityOverrideResponse.builder()

                .id(entity.getId())

                .serviceId(entity.getServiceId())

                .slotId(entity.getSlotId())

                .date(entity.getDate())

                .blocked(entity.getBlocked())

                .reason(entity.getReason())

                .maxBookingsOverride(
                        entity.getCapacityOverride())

                .build();

    }

    @Override
    public List<AvailabilityOverrideResponse> toResponseList(
            List<AvailabilityOverride> entities) {

        return entities.stream()

                .map(this::toResponse)

                .toList();

    }

    @Override
    public void updateEntity(
            AvailabilityOverride entity,
            UpdateAvailabilityOverrideRequest request) {

        entity.setBlocked(request.getBlocked());

        entity.setReason(request.getReason());

        entity.setCapacityOverride(
                request.getCapacityOverride());

    }

}*/
