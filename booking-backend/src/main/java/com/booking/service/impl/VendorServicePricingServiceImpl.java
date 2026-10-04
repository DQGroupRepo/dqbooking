package com.booking.service.impl;

import com.booking.dto.customer.EventPricingResponse;
import com.booking.dto.customer.VendorPricingForDateResponse;
import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.pricing.VendorServicePricingResponse;
import com.booking.dto.pricing.VendorServicePricingVersionResponse;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Comparator;
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


        /*
         * =========================================
         * VERSION
         * =========================================
         *
         * A save always creates a new immutable
         * pricing version.
         */
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


        /*
         * =========================================
         * AUDIT
         * =========================================
         *
         * These values are generated server-side.
         * They must not come from the request body.
         */
        pricing.setCreatedAt(
                Instant.now()
        );

        pricing.setCreatedBy(
                getCurrentUserId()
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
                "Pricing configuration created pricingId={} serviceId={} vendorId={} version={} createdBy={}",
                savedPricing.getId(),
                savedPricing.getServiceId(),
                savedPricing.getVendorId(),
                savedPricing.getVersion(),
                savedPricing.getCreatedBy()
        );


        return pricingMapper.toResponse(
                savedPricing
        );
    }


    /*
     * =========================================
     * GET VERSION HISTORY
     * =========================================
     */
    @Override
    public List<VendorServicePricingVersionResponse>
    getPricingVersions(
            String serviceId
    ) {

        log.info(
                "Retrieving pricing versions serviceId={}",
                serviceId
        );


        VendorService service =
                getService(
                        serviceId
                );

        validateVendorOwnership(
                service
        );


        return vendorServicePricingRepository
                .findByServiceIdOrderByVersionDesc(
                        serviceId
                )
                .stream()
                .map(
                        pricing ->
                                VendorServicePricingVersionResponse
                                        .builder()
                                        .id(
                                                pricing.getId()
                                        )
                                        .version(
                                                pricing.getVersion()
                                        )
                                        .effectiveFrom(
                                                pricing.getEffectiveFrom()
                                        )
                                        .effectiveUntil(
                                                pricing.getEffectiveUntil()
                                        )
                                        .baseAmount(
                                                pricing.getBaseAmount()
                                        )
                                        .createdAt(
                                                pricing.getCreatedAt()
                                        )
                                        .createdBy(
                                                pricing.getCreatedBy()
                                        )
                                        .build()
                )
                .toList();
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


    /*
     * =========================================
     * CURRENT USER ID
     * =========================================
     *
     * This implementation uses the authenticated
     * principal name. In a JWT setup this is
     * normally the subject/user ID.
     */
    private String getCurrentUserId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        if (
                authentication == null ||
                        !authentication.isAuthenticated() ||
                        authentication.getPrincipal() == null ||
                        "anonymousUser".equals(
                                authentication.getPrincipal()
                                        .toString()
                        )
        ) {

            throw new AccessDeniedException(
                    "Authenticated user not found."
            );
        }


        String userId =
                authentication.getName();


        if (
                userId == null ||
                        userId.isBlank()
        ) {

            throw new AccessDeniedException(
                    "Authenticated user ID not found."
            );
        }


        return userId;
    }


}
