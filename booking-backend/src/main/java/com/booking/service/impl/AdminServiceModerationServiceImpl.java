package com.booking.service.impl;

import com.booking.exception.ServiceNotFoundException;
import com.booking.exception.VendorServiceNotFoundException;
import com.booking.model.VendorService;
import com.booking.model.enums.ServiceModerationStatus;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.AdminServiceModerationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminServiceModerationServiceImpl
        implements AdminServiceModerationService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    AdminServiceModerationServiceImpl.class
            );

    private final VendorServiceRepository
            vendorServiceRepository;

    @Override
    public void approveService(
            String serviceId
    ) {

        log.info(
                "Admin approving vendor service serviceId={}",
                serviceId
        );

        VendorService service =
                getService(serviceId);

        service.setModerationStatus(
                ServiceModerationStatus.APPROVED
        );

        service.setActive(true);

        vendorServiceRepository.save(service);

        log.info(
                "Vendor service approved serviceId={} vendorId={}",
                serviceId,
                service.getVendorId()
        );
    }

    @Override
    public void rejectService(
            String serviceId
    ) {

        log.info(
                "Admin rejecting vendor service serviceId={}",
                serviceId
        );

        VendorService service =
                getService(serviceId);

        service.setModerationStatus(
                ServiceModerationStatus.REJECTED
        );

        service.setActive(false);

        vendorServiceRepository.save(service);

        log.info(
                "Vendor service rejected serviceId={} vendorId={}",
                serviceId,
                service.getVendorId()
        );
    }

    @Override
    public void suspendService(
            String serviceId
    ) {

        log.info(
                "Admin suspending vendor service serviceId={}",
                serviceId
        );

        VendorService service =
                vendorServiceRepository
                        .findById(serviceId)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Admin attempted to suspend non-existent service serviceId={}",
                                    serviceId
                            );

                            return new VendorServiceNotFoundException(
                                    "Service not found: "
                                            + serviceId
                            );
                        });

        /*
         * Suspend/deactivate service.
         */
        service.setModerationStatus(
                ServiceModerationStatus.SUSPENDED
        );

        service.setActive(
                false
        );

        /*
         * Remove all discovery selections.
         */
        service.setDiscoveryTags(
                new java.util.HashSet<>()
        );

        vendorServiceRepository.save(
                service
        );

        log.info(
                "Vendor service suspended serviceId={} vendorId={}",
                serviceId,
                service.getVendorId()
        );
    }

    @Override
    public void reactivateService(
            String serviceId
    ) {

        log.info(
                "Admin reactivating vendor service serviceId={}",
                serviceId
        );

        VendorService service =
                getService(serviceId);

        service.setModerationStatus(
                ServiceModerationStatus.APPROVED
        );

        service.setActive(true);

        vendorServiceRepository.save(service);

        log.info(
                "Vendor service reactivated serviceId={} vendorId={}",
                serviceId,
                service.getVendorId()
        );
    }

    private VendorService getService(
            String serviceId
    ) {

        return vendorServiceRepository
                .findById(serviceId)
                .orElseThrow(() -> {

                    log.warn(
                            "Vendor service not found serviceId={}",
                            serviceId
                    );

                    return new ServiceNotFoundException(
                            serviceId
                    );
                });
    }
}