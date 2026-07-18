package com.booking.mapper;

import com.booking.dto.servicesettings.ServiceSettingsResponse;
import com.booking.model.ServiceSettings;

public interface ServiceSettingsMapper {

    ServiceSettingsResponse toResponse(
            ServiceSettings settings);

}