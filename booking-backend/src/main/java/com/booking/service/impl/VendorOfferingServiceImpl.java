package com.booking.service.impl;

import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.pricing.PaymentConfigurationRequest;
import com.booking.dto.service.ServicePackageRequest;
import com.booking.dto.vendorservice.VendorServiceRequest;
import com.booking.dto.vendorservice.VendorServiceResponse;
import com.booking.exception.ResourceNotFoundException;
import com.booking.exception.VendorServiceNotFoundException;
import com.booking.mapper.VendorServiceMapper;
import com.booking.model.User;
import com.booking.model.VendorService;
import com.booking.model.embedded.ServicePackage;
import com.booking.model.enums.ServiceModerationStatus;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.VendorServicePricingService;
import com.booking.service.storage.StorageService;
import com.booking.service.VendorOfferingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorOfferingServiceImpl implements VendorOfferingService {

    private final VendorServiceRepository vendorServiceRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final VendorServiceMapper vendorServiceMapper;
    private final StorageService storageService;
    private final VendorServicePricingService vendorServicePricingService;


    @Override
    public VendorServiceResponse createService(
            VendorServiceRequest request) {

        User vendor =
                authenticatedUserService.getCurrentVendor();

        VendorService vendorService =
                vendorServiceMapper.toEntity(request, vendor);

        vendorService.setActive(false);

        vendorService.setModerationStatus(
                ServiceModerationStatus.PENDING
        );

        vendorService =
                vendorServiceRepository.save(vendorService);

        return vendorServiceMapper.toResponse(vendorService);
    }

    @Override
    public VendorServiceResponse updateService(String serviceId,
                                               VendorServiceRequest request) {

        User vendor = authenticatedUserService.getCurrentVendor();

        VendorService vendorService = vendorServiceRepository
                .findByIdAndVendorIdAndDeletedFalse(serviceId, vendor.getId())
                .orElseThrow(() ->
                        new VendorServiceNotFoundException("Service not found"));

        vendorServiceMapper.updateEntity(vendorService, request);

        return vendorServiceMapper.toResponse(vendorService);
    }

    @Override
    public void deleteService(String serviceId) {

        User vendor = authenticatedUserService.getCurrentVendor();

        VendorService vendorService = vendorServiceRepository
                .findByIdAndVendorIdAndDeletedFalse(serviceId, vendor.getId())
                .orElseThrow(() ->
                        new VendorServiceNotFoundException("Service not found"));

        vendorService.setDeleted(true);
        vendorService.setActive(false);

        vendorServiceRepository.save(vendorService);
    }

    @Override
    public VendorServiceResponse getServiceById(String serviceId) {

        User vendor = authenticatedUserService.getCurrentVendor();

        VendorService vendorService = vendorServiceRepository
                .findByIdAndVendorIdAndDeletedFalse(serviceId, vendor.getId())
                .orElseThrow(() ->
                        new VendorServiceNotFoundException("Service not found"));

        return vendorServiceMapper.toResponse(vendorService);
    }

    @Override
    public List<VendorServiceResponse> getVendorServices() {

        User vendor = authenticatedUserService.getCurrentVendor();

        return vendorServiceRepository
                .findByVendorIdAndDeletedFalse(vendor.getId())
                .stream()
                .map(vendorServiceMapper::toResponse)
                .toList();
    }

    @Override
    public VendorServiceResponse changeStatus(
            String serviceId,
            Boolean active
    ) {

        User vendor =
                authenticatedUserService.getCurrentVendor();

        VendorService vendorService =
                vendorServiceRepository
                        .findByIdAndVendorIdAndDeletedFalse(
                                serviceId,
                                vendor.getId()
                        )
                        .orElseThrow(() ->
                                new VendorServiceNotFoundException(
                                        "Service not found"
                                )
                        );


        /*
         * =========================================
         * UPDATE VENDOR ACTIVE STATUS
         * =========================================
         */

        vendorService.setActive(active);


        /*
         * =========================================
         * STATUS CHANGE REQUIRES ADMIN REVIEW
         * =========================================
         */

        vendorService.setModerationStatus(
                ServiceModerationStatus.PENDING
        );


        vendorService =
                vendorServiceRepository.save(
                        vendorService
                );


        return vendorServiceMapper.toResponse(
                vendorService
        );

    }

    @Override
    public List<VendorServiceResponse> getBundleServices(
            String serviceId) {

        VendorService selectedService =
                vendorServiceRepository
                        .findByIdAndDeletedFalse(serviceId)
                        .orElseThrow(() ->
                                new VendorServiceNotFoundException(
                                        "Service not found"
                                )
                        );

        return vendorServiceRepository
                .findByVendorIdAndBundleEnabledTrueAndActiveTrueAndDeletedFalse(
                        selectedService.getVendorId()
                )
                .stream()
                .filter(service ->
                        !service.getId().equals(serviceId)
                )
                .map(vendorServiceMapper::toResponse)
                .toList();
    }

    private void validatePackages(
            List<ServicePackageRequest> packages
    ) {

        if (packages == null || packages.isEmpty()) {
            return;
        }

        /*
         * Maximum:
         * SILVER
         * GOLD
         * PREMIUM
         */
        if (packages.size() > 3) {

            throw new IllegalArgumentException(
                    "A service can have a maximum of 3 packages."
            );
        }


        /*
         * Prevent duplicate package types.
         *
         * Example:
         *
         * SILVER
         * SILVER
         *
         * is invalid.
         */

        long distinctTypes =
                packages.stream()
                        .map(
                                ServicePackageRequest
                                        ::getType
                        )
                        .distinct()
                        .count();


        if (
                distinctTypes != packages.size()
        ) {

            throw new IllegalArgumentException(
                    "Duplicate package types are not allowed."
            );
        }
    }

    private List<ServicePackage> mapPackages(
            List<ServicePackageRequest> requests
    ) {

        if (
                requests == null ||
                        requests.isEmpty()
        ) {

            return new java.util.ArrayList<>();
        }


        return requests
                .stream()
                .map(request -> {

                    ServicePackage servicePackage =
                            new ServicePackage();


                    servicePackage.setId(
                            java.util.UUID
                                    .randomUUID()
                                    .toString()
                    );


                    servicePackage.setType(
                            request.getType()
                    );


                    servicePackage.setPrice(
                            request.getPrice()
                    );


                    servicePackage.setFeatures(
                            request.getFeatures() == null
                                    ? new java.util.ArrayList<>()
                                    : new java.util.ArrayList<>(
                                    request.getFeatures()
                            )
                    );


                    servicePackage.setActive(
                            true
                    );


                    return servicePackage;

                })
                .toList();
    }

    private List<ServicePackage> mapUpdatedPackages(
            List<ServicePackageRequest> requests,
            List<ServicePackage> existingPackages
    ) {

        if (
                requests == null ||
                        requests.isEmpty()
        ) {

            return new java.util.ArrayList<>();
        }


        if (
                existingPackages == null
        ) {

            existingPackages =
                    new java.util.ArrayList<>();
        }


        List<ServicePackage> oldPackages =
                existingPackages;


        return requests
                .stream()
                .map(request -> {

                    ServicePackage existingPackage =
                            oldPackages
                                    .stream()
                                    .filter(
                                            existing ->
                                                    existing.getType()
                                                            ==
                                                            request.getType()
                                    )
                                    .findFirst()
                                    .orElse(null);


                    ServicePackage servicePackage;

                    if (
                            existingPackage != null
                    ) {

                        servicePackage =
                                existingPackage;

                    } else {

                        servicePackage =
                                new ServicePackage();

                        servicePackage.setId(
                                java.util.UUID
                                        .randomUUID()
                                        .toString()
                        );

                    }


                    servicePackage.setType(
                            request.getType()
                    );


                    servicePackage.setPrice(
                            request.getPrice()
                    );


                    servicePackage.setFeatures(
                            request.getFeatures() == null
                                    ? new java.util.ArrayList<>()
                                    : new java.util.ArrayList<>(
                                    request.getFeatures()
                            )
                    );


                    servicePackage.setActive(
                            true
                    );


                    return servicePackage;

                })
                .toList();
    }

    @Override
    public VendorServiceResponse updatePackages(
            String serviceId,
            List<ServicePackageRequest> packages
    ) {

        VendorService service =
                vendorServiceRepository
                        .findById(serviceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Service not found."
                                )
                        );


        validatePackages(
                packages
        );


        service.setPackages(
                mapUpdatedPackages(
                        packages,
                        service.getPackages()
                )
        );


        service.setUpdatedAt(
                LocalDateTime.now()
        );


        return vendorServiceMapper.toResponse(
                vendorServiceRepository.save(
                        service
                )
        );
    }
}