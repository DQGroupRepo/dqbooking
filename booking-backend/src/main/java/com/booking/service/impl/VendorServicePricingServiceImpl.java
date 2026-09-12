package com.booking.service.impl;

import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.pricing.VendorServicePricingResponse;
import com.booking.exception.ResourceNotFoundException;
import com.booking.mapper.PricingMapper;
import com.booking.model.VendorService;
import com.booking.model.VendorServicePricing;
import com.booking.repository.VendorServicePricingRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.VendorServicePricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorServicePricingServiceImpl
        implements VendorServicePricingService {

    private final VendorServicePricingRepository
            vendorServicePricingRepository;

    private final VendorServiceRepository
            vendorServiceRepository;

    private final PricingMapper pricingMapper;

    private final AuthenticatedUserService
            authenticatedUserService;


    /*
     * =========================================================
     * CREATE NEW PRICING VERSION
     * =========================================================
     *
     * IMPORTANT:
     *
     * We do NOT modify existing pricing.
     *
     * Every pricing change creates a NEW document/version.
     *
     * This protects historical bookings.
     */
    @Override
    public VendorServicePricingResponse createPricing(
            VendorServicePricingRequest request
    ) {

        VendorService service =
                getService(request.getServiceId());


        /*
         * Verify that the authenticated vendor owns
         * this service.
         */
        validateVendorOwnership(service);


        /*
         * Convert request to entity.
         */
        VendorServicePricing pricing =
                pricingMapper.toEntity(request);


        /*
         * Always derive vendorId from the service.
         *
         * Do NOT trust vendorId sent by frontend.
         */
        pricing.setVendorId(
                service.getVendorId()
        );


        pricing.setServiceId(
                service.getId()
        );


        /*
         * Determine next version.
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
         * Set audit timestamps.
         *
         * If BaseEntity auditing is already handling
         * these fields in your project, you can remove
         * these two assignments.
         */
        pricing.setCreatedAt(
                LocalDateTime.now()
        );

        pricing.setUpdatedAt(
                LocalDateTime.now()
        );


        /*
         * Save new pricing version.
         */
        VendorServicePricing savedPricing =

                vendorServicePricingRepository
                        .save(pricing);


        return pricingMapper.toResponse(
                savedPricing
        );
    }


    /*
     * =========================================================
     * GET PRICING BY ID
     * =========================================================
     */
    @Override
    public VendorServicePricingResponse getPricingById(
            String pricingId
    ) {

        VendorServicePricing pricing =

                vendorServicePricingRepository
                        .findById(pricingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pricing configuration not found."
                                )
                        );


        /*
         * Get associated service.
         */
        VendorService service =
                getService(
                        pricing.getServiceId()
                );


        /*
         * Vendor can only access their own pricing.
         */
        validateVendorOwnership(service);


        return pricingMapper.toResponse(
                pricing
        );
    }


    /*
     * =========================================================
     * GET CURRENT PRICING
     * =========================================================
     *
     * Used by vendor pricing screen.
     */
    @Override
    public VendorServicePricingResponse getCurrentPricing(
            String serviceId
    ) {

        VendorService service =
                getService(serviceId);


        /*
         * Security check.
         */
        validateVendorOwnership(service);


        List<VendorServicePricing> pricingVersions =

                vendorServicePricingRepository
                        .findByServiceIdOrderByVersionDesc(
                                serviceId
                        );


        if (pricingVersions.isEmpty()) {

            throw new ResourceNotFoundException(
                    "No pricing configuration found for this service."
            );

        }


        /*
         * First record is the latest version
         * because repository sorts by version DESC.
         */
        VendorServicePricing currentPricing =

                pricingVersions
                        .get(0);


        return pricingMapper.toResponse(
                currentPricing, service
        );
    }


    /*
     * =========================================================
     * GET SERVICE
     * =========================================================
     */
    private VendorService getService(
            String serviceId
    ) {

        return vendorServiceRepository
                .findById(serviceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Vendor service not found."
                        )
                );
    }


    /*
     * =========================================================
     * VALIDATE VENDOR OWNERSHIP
     * =========================================================
     *
     * Prevents Vendor A from modifying or viewing
     * Vendor B's pricing.
     */
    private void validateVendorOwnership(
            VendorService service
    ) {

        String currentVendorId =

                authenticatedUserService
                        .getCurrentVendor()
                        .getId();


        if (
                !service
                        .getVendorId()
                        .equals(currentVendorId)
        ) {

            throw new AccessDeniedException(
                    "You do not have access to this service."
            );

        }

    }

    @Override
    public VendorServicePricingResponse getPricing(
            String pricingId
    ) {

        VendorServicePricing pricing =

                vendorServicePricingRepository

                        .findById(pricingId)

                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pricing not found."
                                )
                        );


        VendorService service =
                getService(
                        pricing.getServiceId()
                );


        return pricingMapper.toResponse(
                pricing,
                service
        );

    }

}