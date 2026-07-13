package com.booking.mapper;

import com.booking.dto.vendorservice.ContactInfoDto;
import com.booking.model.embedded.ContactInfo;

public interface ContactInfoMapper {

    ContactInfo toEntity(ContactInfoDto dto);

    ContactInfoDto toDto(ContactInfo entity);

}