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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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

    private final VendorAccessService
            vendorAccessService;


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
                getService(
                        request.getServiceId()
                );


        /*
         * Verify that the effective vendor owns
         * this service.
         *
         * Normal VENDOR:
         *      current vendor
         *
         * ADMIN Support Mode:
         *      supported vendor
         */
        validateVendorOwnership(
                service
        );


        /*
         * Convert request to entity.
         */
        VendorServicePricing pricing =
                pricingMapper.toEntity(
                        request
                );


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
         * BaseEntity auditing handles:
         *
         * created_user
         * created_ts
         * last_update_user
         * last_update_ts
         *
         * No manual audit timestamps are needed.
         */


        /*
         * Save the new pricing version.
         */
        VendorServicePricing savedPricing =
                vendorServicePricingRepository
                        .save(
                                pricing
                        );


        /*
         * =====================================================
         * SYNC STARTING PRICE
         * =====================================================
         *
         * VendorServicePricing remains the pricing
         * configuration/history source.
         *
         * VendorService.startingPrice is maintained as
         * a searchable/filterable/listing value.
         *
         * It is synchronized whenever a new pricing
         * version is created.
         */
        syncStartingPrice(
                savedPricing.getServiceId(),
                savedPricing.getBaseAmount()
        );


        return pricingMapper.toResponse(
                savedPricing
        );

    }


    /*
     * =========================================================
     * SYNC STARTING PRICE
     * =========================================================
     */
    private void syncStartingPrice(
            String serviceId,
            BigDecimal baseAmount
    ) {

        VendorService vendorService =
                vendorServiceRepository
                        .findById(
                                serviceId
                        )
                        .orElseThrow(() ->
                                new VendorServiceNotFoundException(
                                        "Service not found"
                                )
                        );


        /*
         * Keep VendorService.startingPrice synchronized
         * with the latest pricing base amount.
         *
         * This value can then be used efficiently for:
         *
         * - customer listing
         * - filtering
         * - sorting
         * - discovery sections
         * - search results
         */
        vendorService.setStartingPrice(
                baseAmount
        );


        vendorServiceRepository.save(
                vendorService
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
                        .findById(
                                pricingId
                        )
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
         * Effective vendor can only access
         * pricing belonging to their service.
         */
        validateVendorOwnership(
                service
        );


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
                getService(
                        serviceId
                );


        /*
         * Security check.
         */
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

            throw new ResourceNotFoundException(
                    "No pricing configuration found for this service."
            );

        }


        /*
         * First record is the latest version
         * because repository sorts by version DESC.
         */
        VendorServicePricing currentPricing =
                pricingVersions.get(0);


        return pricingMapper.toResponse(
                currentPricing,
                service
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
                .findById(
                        serviceId
                )
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
     * Normal Vendor:
     *
     *      effectiveVendorId = logged-in vendor ID
     *
     * Admin Support Mode:
     *
     *      effectiveVendorId = supported vendor ID
     *
     * This prevents Vendor A, or an admin supporting
     * Vendor A, from accessing Vendor B's pricing.
     */
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

            throw new AccessDeniedException(
                    "You do not have access to this service."
            );

        }

    }


    /*
     * =========================================================
     * GET PRICING
     * =========================================================
     */
    @Override
    public VendorServicePricingResponse getPricing(
            String pricingId
    ) {

        VendorServicePricing pricing =
                vendorServicePricingRepository
                        .findById(
                                pricingId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pricing not found."
                                )
                        );


        VendorService service =
                getService(
                        pricing.getServiceId()
                );


        /*
         * Validate ownership here as well.
         *
         * The previous implementation loaded the
         * pricing/service but did not verify that
         * the current vendor owned the service.
         */
        validateVendorOwnership(
                service
        );


        return pricingMapper.toResponse(
                pricing,
                service
        );

    }

}