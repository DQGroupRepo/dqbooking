package com.booking.mapper;

import com.booking.dto.service.CateringDetailsRequest;
import com.booking.dto.service.CateringDetailsResponse;
import com.booking.model.embedded.CateringDetails;

public interface CateringDetailsMapper {

    CateringDetails toEntity(
            CateringDetailsRequest request
    );

    CateringDetailsResponse toResponse(
            CateringDetails entity
    );
}