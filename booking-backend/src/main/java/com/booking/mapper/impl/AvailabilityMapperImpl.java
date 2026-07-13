package com.booking.mapper.impl;

import com.booking.dto.vendorservice.AvailabilityDto;
import com.booking.mapper.AvailabilityMapper;
import com.booking.model.embedded.Availability;
import org.springframework.stereotype.Component;

@Component
public class AvailabilityMapperImpl implements AvailabilityMapper {

    @Override
    public Availability toEntity(AvailabilityDto dto) {

        if (dto == null) {
            return null;
        }

        Availability entity = new Availability();

        entity.setAvailableFrom(dto.getAvailableFrom());
        entity.setAvailableTo(dto.getAvailableTo());

        return entity;
    }

    @Override
    public AvailabilityDto toDto(Availability entity) {

        if (entity == null) {
            return null;
        }

        AvailabilityDto dto = new AvailabilityDto();

        dto.setAvailableFrom(entity.getAvailableFrom());
        dto.setAvailableTo(entity.getAvailableTo());

        return dto;
    }

}