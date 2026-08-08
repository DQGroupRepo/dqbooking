package com.booking.mapper.impl;

import com.booking.dto.servicesettings.ServiceSettingsResponse;
import com.booking.mapper.ServiceSettingsMapper;
import com.booking.model.ServiceSettings;
import org.springframework.stereotype.Component;
import com.booking.mapper.CancellationPolicyMapper;

@Component
public class ServiceSettingsMapperImpl
        implements ServiceSettingsMapper {

    private final CancellationPolicyMapper cancellationPolicyMapper;

    public ServiceSettingsMapperImpl(
            CancellationPolicyMapper cancellationPolicyMapper
    ) {
        this.cancellationPolicyMapper = cancellationPolicyMapper;
    }

    @Override
    public ServiceSettingsResponse toResponse(ServiceSettings settings) {

        ServiceSettingsResponse response =
                new ServiceSettingsResponse();

        response.setMinimumAdvanceDays(settings.getMinimumAdvanceDays());
        response.setMaximumAdvanceDays(settings.getMaximumAdvanceDays());

        response.setMinimumGuests(settings.getMinimumGuests());
        response.setMaximumGuests(settings.getMaximumGuests());

        response.setDepositPercentage(settings.getDepositPercentage());
        response.setBalanceDueDays(settings.getBalanceDueDays());

        response.setCancellationPolicy(
                cancellationPolicyMapper.toResponse(
                        settings.getCancellationPolicy()
                )
        );
        response.setActive(settings.getActive());
        response.setInstantBooking(settings.getInstantBooking());

        return response;
    }
}