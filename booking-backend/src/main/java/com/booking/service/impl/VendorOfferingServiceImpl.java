package com.booking.service.impl;

import com.booking.config.LoggingContext;
import com.booking.dto.vendorservice.VendorServiceRequest;
import com.booking.dto.vendorservice.VendorServiceResponse;
import com.booking.exception.VendorServiceNotFoundException;
import com.booking.model.enums.ServiceCategory;
import com.booking.mapper.VendorServiceMapper;
import com.booking.model.User;
import com.booking.model.VendorService;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorOfferingServiceImpl
        implements VendorOfferingService {

    private final VendorServiceRepository vendorServiceRepository;

    private final UserRepository userRepository;

    private final VendorAccessService vendorAccessService;

    private final VendorPermissionService vendorPermissionService;

    private final VendorServiceMapper vendorServiceMapper;

    private static final Logger log =
            LoggerFactory.getLogger(VendorOfferingServiceImpl.class);
    /*
     * =========================================
     * CREATE SERVICE
     * =========================================
     */

    @Override
    public VendorServiceResponse createService(
            VendorServiceRequest request) {

        log.info(
                "Creating vendor service serviceName={} category={}",
                request.getServiceName(),
                request.getCategory()
        );

        vendorPermissionService.checkEdit(
                VendorPage.SERVICES
        );

        validateCateringDetails(
                request
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        LoggingContext.setVendorId(vendorId);
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

        log.info(
                "Updating vendor service serviceId={}",
                serviceId
        );
        vendorPermissionService.checkEdit(
                VendorPage.SERVICES
        );

        validateCateringDetails(
                request
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();
        LoggingContext.setVendorId(vendorId);
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
        log.info(
                "Deleting vendor service serviceId={}",
                serviceId
        );

        vendorPermissionService.checkEdit(
                VendorPage.SERVICES
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();
        LoggingContext.setVendorId(vendorId);
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
        LoggingContext.setVendorId(vendorId);
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
        LoggingContext.setVendorId(vendorId);
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
        log.info(
                "Changing vendor service status serviceId={} active={}",
                serviceId,
                active
        );

        vendorPermissionService.checkEdit(
                VendorPage.SERVICES
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();
        LoggingContext.setVendorId(vendorId);
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
        LoggingContext.setVendorId(vendorId);
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