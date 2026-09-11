package com.booking.mapper;

import com.booking.dto.service.ServiceDetailSectionRequest;
import com.booking.dto.service.ServiceDetailSectionResponse;
import com.booking.model.embedded.ServiceDetailSection;

import java.util.List;

public interface ServiceDetailSectionMapper {

    ServiceDetailSection toEntity(
            ServiceDetailSectionRequest request
    );

    ServiceDetailSectionResponse toResponse(
            ServiceDetailSection entity
    );

    List<ServiceDetailSection> toEntityList(
            List<ServiceDetailSectionRequest> requests
    );

    List<ServiceDetailSectionResponse> toResponseList(
            List<ServiceDetailSection> entities
    );

}