package com.booking.service.impl;

import com.booking.exception.ServiceNotFoundException;
import com.booking.model.VendorService;
import com.booking.model.enums.ServiceModerationStatus;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.AdminServiceModerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminServiceModerationServiceImpl
        implements AdminServiceModerationService {

    private final VendorServiceRepository
            vendorServiceRepository;

    @Override
    public void approveService(String serviceId) {

        VendorService service =
                getService(serviceId);

        service.setModerationStatus(
                ServiceModerationStatus.APPROVED
        );

        service.setActive(true);

        vendorServiceRepository.save(service);
    }

    @Override
    public void rejectService(String serviceId) {

        VendorService service =
                getService(serviceId);

        service.setModerationStatus(
                ServiceModerationStatus.REJECTED
        );

        service.setActive(false);

        vendorServiceRepository.save(service);
    }

    @Override
    public void suspendService(String serviceId) {

        VendorService service =
                getService(serviceId);

        service.setModerationStatus(
                ServiceModerationStatus.SUSPENDED
        );

        service.setActive(false);

        vendorServiceRepository.save(service);
    }

    @Override
    public void reactivateService(String serviceId) {

        VendorService service =
                getService(serviceId);

        service.setModerationStatus(
                ServiceModerationStatus.APPROVED
        );

        service.setActive(true);

        vendorServiceRepository.save(service);
    }

    private VendorService getService(
            String serviceId
    ) {

        return vendorServiceRepository
                .findById(serviceId)
                .orElseThrow(() ->
                        new ServiceNotFoundException(
                                serviceId
                        ));
    }
}