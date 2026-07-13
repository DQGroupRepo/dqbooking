package com.booking.mapper.impl;

import com.booking.dto.vendorservice.BookingSettingsDto;
import com.booking.mapper.BookingSettingsMapper;
import com.booking.model.embedded.BookingSettings;
import org.springframework.stereotype.Component;

@Component
public class BookingSettingsMapperImpl implements BookingSettingsMapper {

    public BookingSettings toEntity(BookingSettingsDto dto){
        if (dto == null) {
            return null;
        }

        BookingSettings entity = new BookingSettings();

        entity.setMaxSimultaneousBookings(dto.getMaxSimultaneousBookings());
        entity.setBundleOfferEnabled(dto.getBundleOfferEnabled());

        return entity;
    }

    public BookingSettingsDto toDto(BookingSettings entity) {
        if (entity == null) {
            return null;
        }

        BookingSettingsDto dto = new BookingSettingsDto();

        dto.setMaxSimultaneousBookings(entity.getMaxSimultaneousBookings());
        dto.setBundleOfferEnabled(entity.getBundleOfferEnabled());

        return dto;
    }

}

