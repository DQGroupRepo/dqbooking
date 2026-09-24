package com.booking.service.impl;

import com.booking.dto.service.ServicePackageRequest;
import com.booking.dto.vendorservice.VendorServiceRequest;
import com.booking.dto.vendorservice.VendorServiceResponse;
import com.booking.exception.ResourceNotFoundException;
import com.booking.exception.VendorServiceNotFoundException;
import com.booking.model.enums.ServiceCategory;
import com.booking.mapper.VendorServiceMapper;
import com.booking.model.User;
import com.booking.model.VendorService;
import com.booking.model.embedded.ServicePackage;
import com.booking.model.enums.Role;
import com.booking.model.enums.ServiceModerationStatus;
import com.booking.model.enums.VendorPage;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.VendorAccessService;
import com.booking.service.VendorOfferingService;
import com.booking.service.VendorPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VendorOfferingServiceImpl
        implements VendorOfferingService {

    private final VendorServiceRepository vendorServiceRepository;

    private final UserRepository userRepository;

    private final VendorAccessService vendorAccessService;

    private final VendorPermissionService vendorPermissionService;

    private final VendorServiceMapper vendorServiceMapper;


    /*
     * =========================================
     * CREATE SERVICE
     * =========================================
     */

    @Override
    public VendorServiceResponse createService(
            VendorServiceRequest request) {

        vendorPermissionService.checkEdit(
                VendorPage.SERVICES
        );

        validateCateringDetails(
                request
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        /*
         * Load the actual vendor user.
         *
         * This is important because the mapper
         * expects the vendor User object.
         */

        User vendor =
                userRepository
                        .findById(vendorId)
                        .filter(user -> user.getRole() == Role.VENDOR_ADMIN)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Vendor admin not found."
                                )
                        );


        VendorService vendorService =
                vendorServiceMapper.toEntity(
                        request,
                        vendor
                );

        /*
         * Newly created services require
         * admin moderation.
         */

        vendorService.setActive(false);

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


    /*
     * =========================================
     * UPDATE SERVICE
     * =========================================
     */

    @Override
    public VendorServiceResponse updateService(
            String serviceId,
            VendorServiceRequest request) {

        vendorPermissionService.checkEdit(
                VendorPage.SERVICES
        );

        validateCateringDetails(
                request
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        VendorService vendorService =
                vendorServiceRepository
                        .findByIdAndVendorIdAndDeletedFalse(
                                serviceId,
                                vendorId
                        )
                        .orElseThrow(() ->
                                new VendorServiceNotFoundException(
                                        "Service not found"
                                )
                        );

        vendorServiceMapper.updateEntity(
                vendorService,
                request
        );

        VendorService savedService =
                vendorServiceRepository.save(
                        vendorService
                );

        return vendorServiceMapper.toResponse(
                savedService
        );
    }


    /*
     * =========================================
     * DELETE SERVICE
     * =========================================
     */

    @Override
    public void deleteService(
            String serviceId) {

        vendorPermissionService.checkEdit(
                VendorPage.SERVICES
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        VendorService vendorService =
                vendorServiceRepository
                        .findByIdAndVendorIdAndDeletedFalse(
                                serviceId,
                                vendorId
                        )
                        .orElseThrow(() ->
                                new VendorServiceNotFoundException(
                                        "Service not found"
                                )
                        );

        vendorService.setDeleted(true);

        vendorService.setActive(false);

        vendorServiceRepository.save(
                vendorService
        );
    }


    /*
     * =========================================
     * GET SERVICE
     * =========================================
     */

    @Override
    public VendorServiceResponse getServiceById(
            String serviceId) {

        vendorPermissionService.checkView(
                VendorPage.SERVICES
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        VendorService vendorService =
                vendorServiceRepository
                        .findByIdAndVendorIdAndDeletedFalse(
                                serviceId,
                                vendorId
                        )
                        .orElseThrow(() ->
                                new VendorServiceNotFoundException(
                                        "Service not found"
                                )
                        );

        return vendorServiceMapper.toResponse(
                vendorService
        );
    }


    /*
     * =========================================
     * GET VENDOR SERVICES
     * =========================================
     */

    @Override
    public List<VendorServiceResponse> getVendorServices() {

        vendorPermissionService.checkView(
                VendorPage.SERVICES
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        return vendorServiceRepository
                .findByVendorIdAndDeletedFalse(
                        vendorId
                )
                .stream()
                .map(
                        vendorServiceMapper::toResponse
                )
                .toList();
    }


    /*
     * =========================================
     * CHANGE SERVICE STATUS
     * =========================================
     */

    @Override
    public VendorServiceResponse changeStatus(
            String serviceId,
            Boolean active
    ) {

        vendorPermissionService.checkEdit(
                VendorPage.SERVICES
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        VendorService vendorService =
                vendorServiceRepository
                        .findByIdAndVendorIdAndDeletedFalse(
                                serviceId,
                                vendorId
                        )
                        .orElseThrow(() ->
                                new VendorServiceNotFoundException(
                                        "Service not found"
                                )
                        );

        /*
         * =========================================
         * UPDATE ACTIVE STATUS
         * =========================================
         */

        vendorService.setActive(
                active
        );

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


    /*
     * =========================================
     * GET BUNDLE SERVICES
     * =========================================
     */

    @Override
    public List<VendorServiceResponse> getBundleServices(
            String serviceId) {

        vendorPermissionService.checkView(
                VendorPage.SERVICES
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        /*
         * The selected service must belong to
         * the vendor currently being operated on.
         */

        VendorService selectedService =
                vendorServiceRepository
                        .findByIdAndVendorIdAndDeletedFalse(
                                serviceId,
                                vendorId
                        )
                        .orElseThrow(() ->
                                new VendorServiceNotFoundException(
                                        "Service not found"
                                )
                        );

        return vendorServiceRepository
                .findByVendorIdAndBundleEnabledTrueAndActiveTrueAndDeletedFalse(
                        vendorId
                )
                .stream()
                .filter(service ->
                        !service.getId().equals(
                                selectedService.getId()
                        )
                )
                .map(
                        vendorServiceMapper::toResponse
                )
                .toList();
    }


    /*
     * =========================================
     * PACKAGE VALIDATION
     * =========================================
     */

    private void validatePackages(List<ServicePackageRequest> packages) {

        if (packages == null || packages.isEmpty()) {
            return;
        }

        for (ServicePackageRequest request : packages) {

            if (request.getName() == null || request.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Package name is required.");
            }

            if (request.getPrice() == null
                    || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException(
                        "Package price must be greater than zero."
                );
            }
        }
    }


    /*
     * =========================================
     * MAP NEW PACKAGES
     * =========================================
     */

    private List<ServicePackage> mapPackages(
            List<ServicePackageRequest> requests
    ) {

        if (requests == null || requests.isEmpty()) {
            return new ArrayList<>();
        }

        return requests.stream()
                .map(request -> {

                    ServicePackage servicePackage = new ServicePackage();

                    servicePackage.setId(
                            request.getId() != null
                                    && !request.getId().isBlank()
                                    ? request.getId()
                                    : UUID.randomUUID().toString()
                    );

                    servicePackage.setName(
                            request.getName().trim()
                    );

                    servicePackage.setPrice(
                            request.getPrice()
                    );

                    servicePackage.setFeatures(
                            request.getFeatures() == null
                                    ? new ArrayList<>()
                                    : new ArrayList<>(request.getFeatures())
                    );

                    servicePackage.setActive(
                            request.isActive()
                    );

                    return servicePackage;
                })
                .toList();
    }


    /*
     * =========================================
     * MAP UPDATED PACKAGES
     * =========================================
     */

    private List<ServicePackage> mapUpdatedPackages(
            List<ServicePackageRequest> requests,
            List<ServicePackage> existingPackages
    ) {

        if (requests == null || requests.isEmpty()) {
            return new ArrayList<>();
        }

        if (existingPackages == null) {
            existingPackages = new ArrayList<>();
        }

        List<ServicePackage> oldPackages = existingPackages;

        return requests.stream()
                .map(request -> {

                    ServicePackage existingPackage = oldPackages.stream()
                            .filter(existing ->
                                    existing.getId() != null
                                            && existing.getId().equals(request.getId())
                            )
                            .findFirst()
                            .orElse(null);

                    ServicePackage servicePackage;

                    if (existingPackage != null) {
                        servicePackage = existingPackage;
                    } else {
                        servicePackage = new ServicePackage();

                        servicePackage.setId(
                                request.getId() != null
                                        && !request.getId().isBlank()
                                        ? request.getId()
                                        : UUID.randomUUID().toString()
                        );
                    }

                    servicePackage.setName(
                            request.getName().trim()
                    );

                    servicePackage.setPrice(
                            request.getPrice()
                    );

                    servicePackage.setFeatures(
                            request.getFeatures() == null
                                    ? new ArrayList<>()
                                    : new ArrayList<>(request.getFeatures())
                    );

                    servicePackage.setActive(
                            request.isActive()
                    );

                    return servicePackage;
                })
                .toList();
    }


    /*
     * =========================================
     * UPDATE PACKAGES
     * =========================================
     */

    @Override
    public VendorServiceResponse updatePackages(
            String serviceId,
            List<ServicePackageRequest> packages
    ) {

        vendorPermissionService.checkEdit(
                VendorPage.SERVICES
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        /*
         * IMPORTANT:
         *
         * Do not allow an admin in support mode
         * to update a service belonging to another
         * vendor simply by knowing its serviceId.
         */

        VendorService service =
                vendorServiceRepository
                        .findByIdAndVendorIdAndDeletedFalse(
                                serviceId,
                                vendorId
                        )
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

        return vendorServiceMapper.toResponse(
                vendorServiceRepository.save(
                        service
                )
        );
    }

    /*
     * =========================================
     * CATERING VALIDATION
     * =========================================
     */

    private void validateCateringDetails(
            VendorServiceRequest request
    ) {

        if (request == null) {
            return;
        }

        if (
                request.getCategory() == ServiceCategory.CATERING
                        &&
                        request.getCateringDetails() == null
        ) {
            throw new IllegalArgumentException(
                    "Catering details are required for catering services."
            );
        }

        if (
                request.getCategory() != ServiceCategory.CATERING
                        &&
                        request.getCateringDetails() != null
        ) {
            throw new IllegalArgumentException(
                    "Catering details are only allowed for catering services."
            );
        }
    }
}