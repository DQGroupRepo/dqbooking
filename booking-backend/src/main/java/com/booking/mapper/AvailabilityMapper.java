package com.booking.mapper;

import com.booking.dto.vendorservice.AvailabilityDto;
import com.booking.model.embedded.Availability;

public interface AvailabilityMapper {

    Availability toEntity(AvailabilityDto dto);

    AvailabilityDto toDto(Availability entity);

}