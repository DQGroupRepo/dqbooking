package com.booking.service;

import com.booking.dto.servicesettings.ServiceSettingsResponse;
import com.booking.dto.servicesettings.ServiceSettingsRequest;

public interface ServiceSettingsService {

    ServiceSettingsResponse getSettings(String serviceId);

    ServiceSettingsResponse updateSettings(
            String serviceId,
            ServiceSettingsRequest request
    );

}