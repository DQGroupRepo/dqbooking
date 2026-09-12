package com.booking.mapper.impl;

import com.booking.dto.service.ServiceAttributeRequest;
import com.booking.dto.service.ServiceAttributeResponse;
import com.booking.dto.service.ServiceDetailSectionRequest;
import com.booking.dto.service.ServiceDetailSectionResponse;
import com.booking.mapper.ServiceDetailSectionMapper;
import com.booking.model.ServiceAttribute;
import com.booking.model.embedded.ServiceDetailSection;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ServiceDetailSectionMapperImpl
        implements ServiceDetailSectionMapper {

    @Override
    public ServiceDetailSection toEntity(
            ServiceDetailSectionRequest request
    ) {

        if (request == null) {
            return null;
        }

        ServiceDetailSection entity =
                new ServiceDetailSection();

        entity.setKey(
                request.getKey()
        );

        entity.setTitle(
                request.getTitle()
        );

        entity.setAttributes(
                toEntityAttributeList(
                        request.getAttributes()
                )
        );

        return entity;
    }


    @Override
    public ServiceDetailSectionResponse toResponse(
            ServiceDetailSection entity
    ) {

        if (entity == null) {
            return null;
        }

        ServiceDetailSectionResponse response =
                new ServiceDetailSectionResponse();

        response.setKey(
                entity.getKey()
        );

        response.setTitle(
                entity.getTitle()
        );

        response.setAttributes(
                toResponseAttributeList(
                        entity.getAttributes()
                )
        );

        return response;
    }


    /*
     * =========================================
     * ATTRIBUTE REQUEST -> ENTITY
     * =========================================
     */

    private ServiceAttribute toEntityAttribute(
            ServiceAttributeRequest request
    ) {

        if (request == null) {
            return null;
        }

        ServiceAttribute attribute =
                new ServiceAttribute();

        attribute.setKey(
                request.getKey()
        );

        attribute.setValue(
                request.getValue()
        );

        return attribute;
    }


    /*
     * =========================================
     * ATTRIBUTE ENTITY -> RESPONSE
     * =========================================
     */

    private ServiceAttributeResponse toResponseAttribute(
            ServiceAttribute entity
    ) {

        if (entity == null) {
            return null;
        }

        ServiceAttributeResponse response =
                new ServiceAttributeResponse();

        response.setKey(
                entity.getKey()
        );

        response.setValue(
                entity.getValue()
        );

        return response;
    }


    /*
     * =========================================
     * ATTRIBUTE LIST REQUEST -> ENTITY
     * =========================================
     */

    private List<ServiceAttribute> toEntityAttributeList(
            List<ServiceAttributeRequest> requests
    ) {

        if (requests == null) {
            return new ArrayList<>();
        }

        return requests
                .stream()
                .filter(request -> request != null)
                .map(this::toEntityAttribute)
                .toList();
    }


    /*
     * =========================================
     * ATTRIBUTE LIST ENTITY -> RESPONSE
     * =========================================
     */

    private List<ServiceAttributeResponse>
    toResponseAttributeList(
            List<ServiceAttribute> entities
    ) {

        if (entities == null) {
            return new ArrayList<>();
        }

        return entities
                .stream()
                .filter(entity -> entity != null)
                .map(this::toResponseAttribute)
                .toList();
    }


    /*
     * =========================================
     * SECTION LIST REQUEST -> ENTITY
     * =========================================
     */

    @Override
    public List<ServiceDetailSection> toEntityList(
            List<ServiceDetailSectionRequest> requests
    ) {

        if (requests == null) {
            return new ArrayList<>();
        }

        return requests
                .stream()
                .filter(request -> request != null)
                .map(this::toEntity)
                .toList();
    }


    /*
     * =========================================
     * SECTION LIST ENTITY -> RESPONSE
     * =========================================
     */

    @Override
    public List<ServiceDetailSectionResponse> toResponseList(
            List<ServiceDetailSection> entities
    ) {

        if (entities == null) {
            return new ArrayList<>();
        }

        return entities
                .stream()
                .filter(entity -> entity != null)
                .map(this::toResponse)
                .toList();
    }

}