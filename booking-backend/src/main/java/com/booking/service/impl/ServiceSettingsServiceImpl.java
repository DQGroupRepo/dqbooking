package com.booking.service.impl;

import com.booking.dto.servicesettings.ServiceSettingsResponse;
import com.booking.dto.servicesettings.ServiceSettingsRequest;
import com.booking.exception.ResourceNotFoundException;
import com.booking.mapper.ServiceSettingsMapper;
import com.booking.model.ServiceSettings;
import com.booking.model.VendorService;
import com.booking.repository.ServiceSettingsRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.ServiceSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import com.booking.mapper.CancellationPolicyMapper;

@Service
@RequiredArgsConstructor
public class ServiceSettingsServiceImpl
        implements ServiceSettingsService {

    private final ServiceSettingsRepository serviceSettingsRepository;

    private final VendorServiceRepository vendorServiceRepository;

    private final ServiceSettingsMapper serviceSettingsMapper;

    private final AuthenticatedUserService authenticatedUserService;

    private final CancellationPolicyMapper cancellationPolicyMapper;

    @Override
    public ServiceSettingsResponse getSettings(String serviceId) {

        VendorService vendorService =
                vendorServiceRepository.findById(serviceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Service not found"));

        String vendorId =
                authenticatedUserService
                        .getCurrentVendor()
                        .getId();

        if (!vendorService.getVendorId().equals(vendorId)) {

            throw new AccessDeniedException("Access denied.");

        }

        ServiceSettings settings =
                serviceSettingsRepository
                        .findByServiceId(serviceId)
                        .orElseGet(() -> createDefault(serviceId));

        return serviceSettingsMapper.toResponse(settings);

    }

    @Override
    public ServiceSettingsResponse updateSettings(
            String serviceId,
            ServiceSettingsRequest request) {

        VendorService vendorService =
                vendorServiceRepository.findById(serviceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Service not found"));

        String vendorId =
                authenticatedUserService
                        .getCurrentVendor()
                        .getId();

        if (!vendorService.getVendorId().equals(vendorId)) {

            throw new AccessDeniedException("Access denied.");

        }

        ServiceSettings settings =
                serviceSettingsRepository
                        .findByServiceId(serviceId)
                        .orElseGet(() -> createDefault(serviceId));

        settings.setMinimumAdvanceDays(request.getMinimumAdvanceDays());
        settings.setMaximumAdvanceDays(request.getMaximumAdvanceDays());

        settings.setMinimumGuests(request.getMinimumGuests());
        settings.setMaximumGuests(request.getMaximumGuests());

        settings.setDepositPercentage(request.getDepositPercentage());
        settings.setBalanceDueDays(request.getBalanceDueDays());
        if (request.getCancellationPolicy() != null) {

            settings.setCancellationPolicy(

                    cancellationPolicyMapper.toEntity(
                            request.getCancellationPolicy()
                    )

            );

        }

        settings.setInstantBooking(request.getInstantBooking());

        settings = serviceSettingsRepository.save(settings);

        return serviceSettingsMapper.toResponse(settings);

    }

    private ServiceSettings createDefault(String serviceId) {

        ServiceSettings settings = new ServiceSettings();

        settings.setServiceId(serviceId);

        settings.setMinimumAdvanceDays(1);
        settings.setMaximumAdvanceDays(365);

        settings.setMinimumGuests(1);
        settings.setMaximumGuests(500);

        settings.setDepositPercentage(25);
        settings.setBalanceDueDays(7);
        settings.setCancellationPolicy(
                cancellationPolicyMapper.defaultPolicy()
        );

        settings.setActive(true);
        settings.setInstantBooking(false);

        return serviceSettingsRepository.save(settings);

    }

}