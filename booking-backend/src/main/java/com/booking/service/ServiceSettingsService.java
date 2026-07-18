package com.booking.service;

import com.booking.dto.servicesettings.ServiceSettingsResponse;
import com.booking.dto.servicesettings.UpdateServiceSettingsRequest;

public interface ServiceSettingsService {

    ServiceSettingsResponse getSettings(String serviceId);

    ServiceSettingsResponse updateSettings(
            String serviceId,
            UpdateServiceSettingsRequest request
    );

}