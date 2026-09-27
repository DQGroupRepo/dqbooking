package com.booking.service.impl;

import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.pricing.VendorServicePricingResponse;
import com.booking.exception.ResourceNotFoundException;
import com.booking.exception.VendorServiceNotFoundException;
import com.booking.mapper.PricingMapper;
import com.booking.model.VendorService;
import com.booking.model.VendorServicePricing;
import com.booking.repository.VendorServicePricingRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.VendorAccessService;
import com.booking.service.VendorServicePricingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorServicePricingServiceImpl
        implements VendorServicePricingService {

    private final VendorServicePricingRepository
            vendorServicePricingRepository;

    private final VendorServiceRepository
            vendorServiceRepository;

    private final PricingMapper pricingMapper;

    private final VendorAccessService
            vendorAccessService;

    @Override
    public VendorServicePricingResponse createPricing(
            VendorServicePricingRequest request
    ) {

        log.info(
                "Creating pricing configuration serviceId={}",
                request.getServiceId()
        );

        VendorService service =
                getService(
                        request.getServiceId()
                );

        validateVendorOwnership(
                service
        );

        VendorServicePricing pricing =
                pricingMapper.toEntity(
                        request
                );

        pricing.setVendorId(
                service.getVendorId()
        );

        pricing.setServiceId(
                service.getId()
        );

        List<VendorServicePricing> existingPricing =
                vendorServicePricingRepository
                        .findByServiceIdOrderByVersionDesc(
                                service.getId()
                        );

        int nextVersion =
                existingPricing.isEmpty()

                        ? 1

                        : existingPricing
                        .get(0)
                        .getVersion()
                        + 1;

        pricing.setVersion(
                nextVersion
        );

        VendorServicePricing savedPricing =
                vendorServicePricingRepository
                        .save(
                                pricing
                        );

        syncStartingPrice(
                savedPricing.getServiceId(),
                savedPricing.getBaseAmount()
        );

        log.info(
                "Pricing configuration created pricingId={} serviceId={} vendorId={} version={}",
                savedPricing.getId(),
                savedPricing.getServiceId(),
                savedPricing.getVendorId(),
                savedPricing.getVersion()
        );

        return pricingMapper.toResponse(
                savedPricing
        );
    }

    private void syncStartingPrice(
            String serviceId,
            BigDecimal baseAmount
    ) {

        VendorService vendorService =
                vendorServiceRepository
                        .findById(
                                serviceId
                        )
                        .orElseThrow(() -> {
                            log.warn(
                                    "Service not found while synchronizing starting price serviceId={}",
                                    serviceId
                            );

                            return new VendorServiceNotFoundException(
                                    "Service not found"
                            );
                        });

        vendorService.setStartingPrice(
                baseAmount
        );

        vendorServiceRepository.save(
                vendorService
        );

        log.debug(
                "Vendor service starting price synchronized serviceId={}",
                serviceId
        );
    }

    @Override
    public VendorServicePricingResponse getPricingById(
            String pricingId
    ) {

        log.info(
                "Retrieving pricing configuration pricingId={}",
                pricingId
        );

        VendorServicePricing pricing =
                vendorServicePricingRepository
                        .findById(
                                pricingId
                        )
                        .orElseThrow(() -> {
                            log.warn(
                                    "Pricing configuration not found pricingId={}",
                                    pricingId
                            );

                            return new ResourceNotFoundException(
                                    "Pricing configuration not found."
                            );
                        });

        VendorService service =
                getService(
                        pricing.getServiceId()
                );

        validateVendorOwnership(
                service
        );

        log.info(
                "Pricing configuration retrieved pricingId={} serviceId={} version={}",
                pricingId,
                pricing.getServiceId(),
                pricing.getVersion()
        );

        return pricingMapper.toResponse(
                pricing
        );
    }

    @Override
    public VendorServicePricingResponse getCurrentPricing(
            String serviceId
    ) {

        log.info(
                "Retrieving current pricing serviceId={}",
                serviceId
        );

        VendorService service =
                getService(
                        serviceId
                );

        validateVendorOwnership(
                service
        );

        List<VendorServicePricing> pricingVersions =
                vendorServicePricingRepository
                        .findByServiceIdOrderByVersionDesc(
                                serviceId
                        );

        if (
                pricingVersions.isEmpty()
        ) {

            log.warn(
                    "No pricing configuration found for service serviceId={}",
                    serviceId
            );

            throw new ResourceNotFoundException(
                    "No pricing configuration found for this service."
            );
        }

        VendorServicePricing currentPricing =
                pricingVersions.get(0);

        log.info(
                "Current pricing retrieved serviceId={} pricingId={} version={}",
                serviceId,
                currentPricing.getId(),
                currentPricing.getVersion()
        );

        return pricingMapper.toResponse(
                currentPricing,
                service
        );
    }

    private VendorService getService(
            String serviceId
    ) {

        return vendorServiceRepository
                .findById(
                        serviceId
                )
                .orElseThrow(() -> {
                    log.warn(
                            "Vendor service not found serviceId={}",
                            serviceId
                    );

                    return new ResourceNotFoundException(
                            "Vendor service not found."
                    );
                });
    }

    private void validateVendorOwnership(
            VendorService service
    ) {

        String effectiveVendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        if (
                !service
                        .getVendorId()
                        .equals(effectiveVendorId)
        ) {

            log.warn(
                    "Vendor service access denied serviceId={} requestedVendorId={} ownerVendorId={}",
                    service.getId(),
                    effectiveVendorId,
                    service.getVendorId()
            );

            throw new AccessDeniedException(
                    "You do not have access to this service."
            );
        }
    }

    @Override
    public VendorServicePricingResponse getPricing(
            String pricingId
    ) {

        log.info(
                "Retrieving pricing pricingId={}",
                pricingId
        );

        VendorServicePricing pricing =
                vendorServicePricingRepository
                        .findById(
                                pricingId
                        )
                        .orElseThrow(() -> {
                            log.warn(
                                    "Pricing not found pricingId={}",
                                    pricingId
                            );

                            return new ResourceNotFoundException(
                                    "Pricing not found."
                            );
                        });

        VendorService service =
                getService(
                        pricing.getServiceId()
                );

        validateVendorOwnership(
                service
        );

        log.info(
                "Pricing retrieved pricingId={} serviceId={} version={}",
                pricingId,
                pricing.getServiceId(),
                pricing.getVersion()
        );

        return pricingMapper.toResponse(
                pricing,
                service
        );
    }
}
