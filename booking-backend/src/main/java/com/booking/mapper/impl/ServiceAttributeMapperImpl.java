package com.booking.mapper.impl;

import com.booking.dto.vendorservice.ServiceAttributeDto;
import com.booking.mapper.ServiceAttributeMapper;
import com.booking.model.ServiceAttribute;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ServiceAttributeMapperImpl implements ServiceAttributeMapper {
    public ServiceAttribute toEntity(ServiceAttributeDto dto) {
        if (dto == null) {
            return null;
        }

        ServiceAttribute entity = new ServiceAttribute();

        entity.setKey(dto.getKey());
        entity.setValue(dto.getValue());

        return entity;
    }

    public ServiceAttributeDto toDto(ServiceAttribute entity) {
        if (entity == null) {
            return null;
        }

        ServiceAttributeDto dto = new ServiceAttributeDto();

        dto.setKey(entity.getKey());
        dto.setValue(entity.getValue());

        return dto;
    }

    @Override
    public List<ServiceAttribute> toEntityList(List<ServiceAttributeDto> dtoList) {

        if (dtoList == null) {
            return List.of();
        }

        return dtoList.stream()
                .map(this::toEntity)
                .toList();
    }

    @Override
    public List<ServiceAttributeDto> toDtoList(List<ServiceAttribute> entityList) {

        if (entityList == null) {
            return List.of();
        }

        return entityList.stream()
                .map(this::toDto)
                .toList();
    }

}
