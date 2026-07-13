package com.booking.service;

import com.booking.dto.availability.AvailabilityOverrideResponse;
import com.booking.dto.availability.CreateAvailabilityOverrideRequest;
import com.booking.dto.availability.UpdateAvailabilityOverrideRequest;

import java.time.LocalDate;
import java.util.List;

public interface AvailabilityOverrideService {

    AvailabilityOverrideResponse createOverride(
            String serviceId,
            CreateAvailabilityOverrideRequest request
    );

    AvailabilityOverrideResponse updateOverride(
            String overrideId,
            UpdateAvailabilityOverrideRequest request
    );

    void deleteOverride(
            String overrideId
    );

    AvailabilityOverrideResponse getOverride(
            String overrideId
    );

    List<AvailabilityOverrideResponse> getOverrides(
            String serviceId,
            LocalDate date
    );

}