package com.booking.mapper;

import com.booking.dto.availability.AvailabilityOverrideResponse;
import com.booking.dto.availability.CreateAvailabilityOverrideRequest;
import com.booking.dto.availability.UpdateAvailabilityOverrideRequest;
import com.booking.model.AvailabilityOverride;
import org.mapstruct.BeanMapping;

import java.util.List;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AvailabilityOverrideMapper {

    AvailabilityOverride toEntity(
            CreateAvailabilityOverrideRequest request
    );

    AvailabilityOverrideResponse toResponse(
            AvailabilityOverride entity
    );

    List<AvailabilityOverrideResponse> toResponseList(
            List<AvailabilityOverride> entities
    );

    @BeanMapping(
            nullValuePropertyMappingStrategy =
                    NullValuePropertyMappingStrategy.IGNORE
    )
    void updateEntity(
            @MappingTarget AvailabilityOverride entity,
            UpdateAvailabilityOverrideRequest request
    );

}