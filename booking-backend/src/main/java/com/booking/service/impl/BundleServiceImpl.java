package com.booking.service.impl;

import com.booking.dto.bundle.BundleResponse;
import com.booking.dto.bundle.CreateBundleRequest;
import com.booking.dto.bundle.UpdateBundleRequest;
import com.booking.exception.ResourceNotFoundException;
import com.booking.model.Bundle;
import com.booking.model.VendorService;
import com.booking.model.enums.VendorPage;
import com.booking.repository.BundleRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.BundleService;
import com.booking.service.VendorAccessService;
import com.booking.service.VendorPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BundleServiceImpl
        implements BundleService {

    private final BundleRepository bundleRepository;

    private final VendorServiceRepository vendorServiceRepository;

    private final VendorAccessService vendorAccessService;

    private final VendorPermissionService vendorPermissionService;


    /*
     * =========================================
     * CREATE BUNDLE
     * =========================================
     */

    @Override
    public BundleResponse createBundle(
            CreateBundleRequest request
    ) {

        vendorPermissionService.checkEdit(
                VendorPage.BUNDLES
        );

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        validateServicesBelongToVendor(
                request.getServiceIds(),
                vendorId
        );

        Bundle bundle = new Bundle();

        bundle.setVendorId(vendorId);

        bundle.setName(
                request.getName()
        );

        bundle.setDescription(
                request.getDescription()
        );

        bundle.setServiceIds(
                request.getServiceIds()
                        .stream()
                        .distinct()
                        .toList()
        );

        bundle.setDiscountType(
                request.getDiscountType()
                        .toUpperCase()
        );

        bundle.setDiscountValue(
                request.getDiscountValue()
        );

        bundle.setActive(true);

        return toResponse(
                bundleRepository.save(bundle)
        );
    }


    /*
     * =========================================
     * GET BUNDLE
     * =========================================
     */

    @Override
    public BundleResponse getBundle(
            String bundleId
    ) {

        vendorPermissionService.checkView(
                VendorPage.BUNDLES
        );

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        Bundle bundle =
                bundleRepository
                        .findByIdAndVendorId(
                                bundleId,
                                vendorId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bundle not found."
                                )
                        );

        return toResponse(bundle);
    }


    /*
     * =========================================
     * GET VENDOR BUNDLES
     * =========================================
     */

    @Override
    public List<BundleResponse> getVendorBundles() {

        vendorPermissionService.checkView(
                VendorPage.BUNDLES
        );

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        return bundleRepository
                .findByVendorId(vendorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    /*
     * =========================================
     * UPDATE BUNDLE
     * =========================================
     */

    @Override
    public BundleResponse updateBundle(
            String bundleId,
            UpdateBundleRequest request
    ) {

        vendorPermissionService.checkEdit(
                VendorPage.BUNDLES
        );

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        Bundle bundle =
                bundleRepository
                        .findByIdAndVendorId(
                                bundleId,
                                vendorId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bundle not found."
                                )
                        );

        validateServicesBelongToVendor(
                request.getServiceIds(),
                vendorId
        );

        bundle.setName(
                request.getName()
        );

        bundle.setDescription(
                request.getDescription()
        );

        bundle.setServiceIds(
                request.getServiceIds()
                        .stream()
                        .distinct()
                        .toList()
        );

        bundle.setDiscountType(
                request.getDiscountType()
                        .toUpperCase()
        );

        bundle.setDiscountValue(
                request.getDiscountValue()
        );

        bundle.setActive(
                request.isActive()
        );

        return toResponse(
                bundleRepository.save(bundle)
        );
    }


    /*
     * =========================================
     * DELETE BUNDLE
     * =========================================
     */

    @Override
    public void deleteBundle(
            String bundleId
    ) {

        vendorPermissionService.checkEdit(
                VendorPage.BUNDLES
        );

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        Bundle bundle =
                bundleRepository
                        .findByIdAndVendorId(
                                bundleId,
                                vendorId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bundle not found."
                                )
                        );

        bundle.setActive(false);

        bundleRepository.save(bundle);
    }


    /*
     * =========================================
     * ACTIVATE BUNDLE
     * =========================================
     */

    @Override
    public void activateBundle(
            String bundleId
    ) {

        updateBundleStatus(
                bundleId,
                true
        );
    }


    /*
     * =========================================
     * DEACTIVATE BUNDLE
     * =========================================
     */

    @Override
    public void deactivateBundle(
            String bundleId
    ) {

        updateBundleStatus(
                bundleId,
                false
        );
    }


    /*
     * =========================================
     * UPDATE BUNDLE STATUS
     * =========================================
     */

    private void updateBundleStatus(
            String bundleId,
            boolean active
    ) {

        vendorPermissionService.checkEdit(
                VendorPage.BUNDLES
        );

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        Bundle bundle =
                bundleRepository
                        .findByIdAndVendorId(
                                bundleId,
                                vendorId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bundle not found."
                                )
                        );

        bundle.setActive(active);

        bundleRepository.save(bundle);
    }


    /*
     * =========================================
     * VALIDATE SERVICES
     * =========================================
     */

    private void validateServicesBelongToVendor(
            List<String> serviceIds,
            String vendorId
    ) {

        List<String> distinctServiceIds =
                serviceIds
                        .stream()
                        .distinct()
                        .toList();

        for (String serviceId :
                distinctServiceIds) {

            VendorService service =
                    vendorServiceRepository
                            .findByIdAndActiveTrueAndDeletedFalse(
                                    serviceId
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Service not found: "
                                                    + serviceId
                                    )
                            );

            if (!service.getVendorId()
                    .equals(vendorId)) {

                throw new AccessDeniedException(
                        "You cannot add another vendor's service to a bundle."
                );
            }
        }
    }


    /*
     * =========================================
     * RESPONSE MAPPER
     * =========================================
     */

    private BundleResponse toResponse(
            Bundle bundle
    ) {

        return BundleResponse
                .builder()

                .id(
                        bundle.getId()
                )

                .vendorId(
                        bundle.getVendorId()
                )

                .name(
                        bundle.getName()
                )

                .description(
                        bundle.getDescription()
                )

                .serviceIds(
                        bundle.getServiceIds()
                )

                .discountType(
                        bundle.getDiscountType()
                )

                .discountValue(
                        bundle.getDiscountValue()
                )

                .active(
                        bundle.isActive()
                )

                .createdAt(
                        bundle.getCreatedTs()
                )

                .updatedAt(
                        bundle.getLastUpdateTs()
                )

                .build();
    }


    /*
     * =========================================
     * CUSTOMER:
     * GET BUNDLES FOR SERVICE
     * =========================================
     *
     * This endpoint is not vendor-management
     * functionality.
     *
     * Customers need to be able to discover
     * bundles for a service, so DO NOT apply
     * VendorPage.BUNDLES permission here.
     */

    @Override
    public List<BundleResponse> getBundlesForService(
            String serviceId
    ) {

        return bundleRepository
                .findByServiceIdsContainingAndActiveTrue(
                        serviceId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }
}