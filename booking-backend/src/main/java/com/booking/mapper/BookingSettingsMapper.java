package com.booking.mapper;

import com.booking.dto.vendorservice.BookingSettingsDto;
import com.booking.model.embedded.BookingSettings;

public interface BookingSettingsMapper {

    BookingSettings toEntity(BookingSettingsDto dto);

    BookingSettingsDto toDto(BookingSettings entity);

}
