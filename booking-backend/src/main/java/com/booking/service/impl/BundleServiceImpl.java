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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BundleServiceImpl
        implements BundleService {

    private static final Logger log =
            LoggerFactory.getLogger(BundleServiceImpl.class);

    private final BundleRepository bundleRepository;

    private final VendorServiceRepository vendorServiceRepository;

    private final VendorAccessService vendorAccessService;

    private final VendorPermissionService vendorPermissionService;

    @Override
    public BundleResponse createBundle(
            CreateBundleRequest request
    ) {

        vendorPermissionService.checkEdit(
                VendorPage.BUNDLES
        );

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        log.info(
                "Creating bundle vendorId={} serviceCount={}",
                vendorId,
                request.getServiceIds() == null
                        ? 0
                        : request.getServiceIds().size()
        );

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

        bundle =
                bundleRepository.save(bundle);

        log.info(
                "Bundle created bundleId={} vendorId={}",
                bundle.getId(),
                vendorId
        );

        return toResponse(bundle);
    }

    @Override
    public BundleResponse getBundle(
            String bundleId
    ) {

        vendorPermissionService.checkView(
                VendorPage.BUNDLES
        );

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        log.debug(
                "Fetching bundle bundleId={} vendorId={}",
                bundleId,
                vendorId
        );

        Bundle bundle =
                bundleRepository
                        .findByIdAndVendorId(
                                bundleId,
                                vendorId
                        )
                        .orElseThrow(() -> {

                            log.warn(
                                    "Bundle not found bundleId={} vendorId={}",
                                    bundleId,
                                    vendorId
                            );

                            return new ResourceNotFoundException(
                                    "Bundle not found."
                            );
                        });

        return toResponse(bundle);
    }

    @Override
    public List<BundleResponse> getVendorBundles() {

        vendorPermissionService.checkView(
                VendorPage.BUNDLES
        );

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        log.debug(
                "Fetching vendor bundles vendorId={}",
                vendorId
        );

        List<BundleResponse> responses =
                bundleRepository
                        .findByVendorId(vendorId)
                        .stream()
                        .map(this::toResponse)
                        .toList();

        log.info(
                "Vendor bundles fetched vendorId={} count={}",
                vendorId,
                responses.size()
        );

        return responses;
    }

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

        log.info(
                "Updating bundle bundleId={} vendorId={}",
                bundleId,
                vendorId
        );

        Bundle bundle =
                bundleRepository
                        .findByIdAndVendorId(
                                bundleId,
                                vendorId
                        )
                        .orElseThrow(() -> {

                            log.warn(
                                    "Bundle not found for update bundleId={} vendorId={}",
                                    bundleId,
                                    vendorId
                            );

                            return new ResourceNotFoundException(
                                    "Bundle not found."
                            );
                        });

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

        bundle =
                bundleRepository.save(bundle);

        log.info(
                "Bundle updated bundleId={} vendorId={} active={}",
                bundle.getId(),
                vendorId,
                bundle.isActive()
        );

        return toResponse(bundle);
    }

    @Override
    public void deleteBundle(
            String bundleId
    ) {

        vendorPermissionService.checkEdit(
                VendorPage.BUNDLES
        );

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        log.info(
                "Deactivating bundle bundleId={} vendorId={}",
                bundleId,
                vendorId
        );

        Bundle bundle =
                bundleRepository
                        .findByIdAndVendorId(
                                bundleId,
                                vendorId
                        )
                        .orElseThrow(() -> {

                            log.warn(
                                    "Bundle not found for deletion bundleId={} vendorId={}",
                                    bundleId,
                                    vendorId
                            );

                            return new ResourceNotFoundException(
                                    "Bundle not found."
                            );
                        });

        bundle.setActive(false);

        bundleRepository.save(bundle);

        log.info(
                "Bundle deactivated bundleId={} vendorId={}",
                bundleId,
                vendorId
        );
    }

    @Override
    public void activateBundle(
            String bundleId
    ) {

        log.info(
                "Activating bundle bundleId={}",
                bundleId
        );

        updateBundleStatus(
                bundleId,
                true
        );
    }

    @Override
    public void deactivateBundle(
            String bundleId
    ) {

        log.info(
                "Deactivating bundle bundleId={}",
                bundleId
        );

        updateBundleStatus(
                bundleId,
                false
        );
    }

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
                        .orElseThrow(() -> {

                            log.warn(
                                    "Bundle not found for status change bundleId={} vendorId={}",
                                    bundleId,
                                    vendorId
                            );

                            return new ResourceNotFoundException(
                                    "Bundle not found."
                            );
                        });

        bundle.setActive(active);

        bundleRepository.save(bundle);

        log.info(
                "Bundle status changed bundleId={} vendorId={} active={}",
                bundleId,
                vendorId,
                active
        );
    }

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
                            .orElseThrow(() -> {

                                log.warn(
                                        "Bundle service not found serviceId={} vendorId={}",
                                        serviceId,
                                        vendorId
                                );

                                return new ResourceNotFoundException(
                                        "Service not found: "
                                                + serviceId
                                );
                            });

            if (!service.getVendorId()
                    .equals(vendorId)) {

                log.warn(
                        "Attempt to add another vendor service to bundle serviceId={} requestedVendorId={} actualVendorId={}",
                        serviceId,
                        vendorId,
                        service.getVendorId()
                );

                throw new AccessDeniedException(
                        "You cannot add another vendor's service to a bundle."
                );
            }
        }
    }

    private BundleResponse toResponse(
            Bundle bundle
    ) {

        return BundleResponse
                .builder()
                .id(bundle.getId())
                .vendorId(bundle.getVendorId())
                .name(bundle.getName())
                .description(bundle.getDescription())
                .serviceIds(bundle.getServiceIds())
                .discountType(bundle.getDiscountType())
                .discountValue(bundle.getDiscountValue())
                .active(bundle.isActive())
                .createdAt(bundle.getCreatedTs())
                .updatedAt(bundle.getLastUpdateTs())
                .build();
    }

    @Override
    public List<BundleResponse> getBundlesForService(
            String serviceId
    ) {

        log.debug(
                "Fetching customer bundles for service serviceId={}",
                serviceId
        );

        List<BundleResponse> responses =
                bundleRepository
                        .findByServiceIdsContainingAndActiveTrue(
                                serviceId
                        )
                        .stream()
                        .map(this::toResponse)
                        .toList();

        log.info(
                "Customer bundles fetched serviceId={} count={}",
                serviceId,
                responses.size()
        );

        return responses;
    }
}