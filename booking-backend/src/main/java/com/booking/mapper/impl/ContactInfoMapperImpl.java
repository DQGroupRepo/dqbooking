package com.booking.mapper.impl;

import com.booking.dto.vendorservice.ContactInfoDto;
import com.booking.mapper.ContactInfoMapper;
import com.booking.model.embedded.ContactInfo;
import org.springframework.stereotype.Component;

@Component
public class ContactInfoMapperImpl implements ContactInfoMapper {

    @Override
    public ContactInfo toEntity(ContactInfoDto dto) {

        if (dto == null) {
            return null;
        }

        ContactInfo entity = new ContactInfo();

        entity.setContactPerson(dto.getContactPerson());
        entity.setMobile(dto.getMobile());
        entity.setEmail(dto.getEmail());
        entity.setAddress(dto.getAddress()
        );

        return entity;
    }

    @Override
    public ContactInfoDto toDto(ContactInfo entity) {

        if (entity == null) {
            return null;
        }

        ContactInfoDto dto = new ContactInfoDto();

        dto.setContactPerson(entity.getContactPerson());
        dto.setMobile(entity.getMobile());
        dto.setEmail(entity.getEmail());
        dto.setAddress(entity.getAddress());

        return dto;
    }

}