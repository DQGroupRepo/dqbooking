package com.booking.mapper;

import com.booking.dto.vendorservice.ServiceAttributeDto;
import com.booking.model.ServiceAttribute;

import java.util.List;

public interface ServiceAttributeMapper {

    ServiceAttribute toEntity(ServiceAttributeDto dto);

    ServiceAttributeDto toDto(ServiceAttribute entity);

    List<ServiceAttribute> toEntityList(List<ServiceAttributeDto> dtoList);

    List<ServiceAttributeDto> toDtoList(List<ServiceAttribute> entityList);

}