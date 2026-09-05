package com.booking.service.impl;

import com.booking.dto.customer.VendorDetailResponse;
import com.booking.dto.customer.VendorListingResponse;
import com.booking.exception.ServiceNotFoundException;
import com.booking.exception.VendorNotFoundException;
import com.booking.mapper.CustomerVendorMapper;
import com.booking.model.User;
import com.booking.model.VendorService;
import com.booking.model.enums.*;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.booking.model.enums.VendorVerificationStatus;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final VendorServiceRepository vendorServiceRepository;

    private final UserRepository vendorRepository;

    private final CustomerVendorMapper customerVendorMapper;

    @Override
    public VendorDetailResponse getServiceById(
            String serviceId
    ) {

        VendorService service =
                vendorServiceRepository
                        .findById(serviceId)
                        .orElseThrow(() ->
                                new ServiceNotFoundException(serviceId));

        User vendor =
                vendorRepository
                        .findById(service.getVendorId())
                        .orElseThrow(() ->
                                new VendorNotFoundException(
                                        service.getVendorId()
                                ));

        /*
         * =========================================
         * VENDOR VERIFICATION
         * =========================================
         *
         * Only approved vendors can have their
         * services viewed by customers.
         *
         * PENDING and REJECTED vendors are hidden.
         */

        if (vendor.getVerificationStatus()
                != VendorVerificationStatus.APPROVED) {

            throw new ServiceNotFoundException(serviceId);
        }
        if (service.getModerationStatus()
                != ServiceModerationStatus.APPROVED) {

            throw new ServiceNotFoundException(serviceId);
        }

        if (!Boolean.TRUE.equals(service.getActive())
                || Boolean.TRUE.equals(service.getDeleted())) {

            throw new ServiceNotFoundException(serviceId);
        }

        return customerVendorMapper.toDetail(
                vendor,
                service
        );
    }

    @Override
    public List<VendorListingResponse> getVendorListings(
            String category
    ) {

        List<VendorService> services;

        if (category == null || category.isBlank()) {

            services =
                    vendorServiceRepository
                            .findByActiveTrueAndDeletedFalse();

        } else {

            services =
                    vendorServiceRepository
                            .findByCategoryAndActiveTrueAndDeletedFalse(
                                    ServiceCategory.valueOf(
                                            category.toUpperCase()
                                    )
                            );
        }
        return services.stream()
                .map(service -> {

                    User vendor =
                            vendorRepository
                                    .findById(service.getVendorId())
                                    .orElse(null);

                    if (vendor == null) {
                        return null;
                    }

                    if (vendor.getVerificationStatus()
                            != VendorVerificationStatus.APPROVED) {

                        return null;
                    }

                    if (service.getModerationStatus()
                            != ServiceModerationStatus.APPROVED) {

                        return null;
                    }

                    return customerVendorMapper.toListing(
                            vendor,
                            service
                    );

                })
                .filter(java.util.Objects::nonNull)
                .toList();

    }

    @Override
    public List<VendorListingResponse> getFeaturedServices() {

        List<VendorService> services =
                vendorServiceRepository
                        .findByDiscoveryTagAndActiveTrueAndDeletedFalse(
                                ServiceDiscoveryTag.FEATURED
                        );


        return services.stream()
                .map(service -> {

                    User vendor =
                            vendorRepository
                                    .findById(
                                            service.getVendorId()
                                    )
                                    .orElse(null);


                    if (vendor == null) {

                        return null;

                    }


                    /*
                     * Only approved vendors should be
                     * visible to customers.
                     */

                    if (
                            vendor.getVerificationStatus()
                                    != VendorVerificationStatus.APPROVED
                    ) {

                        return null;

                    }


                    /*
                     * Only approved services should be
                     * visible to customers.
                     */

                    if (
                            service.getModerationStatus()
                                    != ServiceModerationStatus.APPROVED
                    ) {

                        return null;

                    }


                    /*
                     * Repository already checks:
                     *
                     * featured = true
                     * active = true
                     * deleted = false
                     *
                     * so no need to repeat those checks.
                     */

                    return customerVendorMapper.toListing(
                            vendor,
                            service
                    );

                })
                .filter(
                        java.util.Objects::nonNull
                )
                .toList();

    }

    @Override
    public List<VendorListingResponse> getPopularHalls() {

        return vendorServiceRepository
                .findByDiscoveryTagAndActiveTrueAndDeletedFalse(
                        ServiceDiscoveryTag.POPULAR_HALL
                )
                .stream()
                .map(
                        this::toVendorListingResponse
                )
                .filter(
                        Objects::nonNull
                )
                .toList();

    }

    @Override
    public List<VendorListingResponse> getTopBridalMakeup() {

        return vendorServiceRepository
                .findByDiscoveryTagAndActiveTrueAndDeletedFalse(
                        ServiceDiscoveryTag.TOP_BRIDAL_MAKEUP
                )
                .stream()
                .map(
                        this::toVendorListingResponse
                )
                .filter(
                        Objects::nonNull
                )
                .toList();

    }

    @Override
    public List<VendorListingResponse>
    getProfessionalPhotography() {

        return vendorServiceRepository
                .findByDiscoveryTagAndActiveTrueAndDeletedFalse(
                        ServiceDiscoveryTag.PROFESSIONAL_PHOTOGRAPHY
                )
                .stream()
                .map(
                        this::toVendorListingResponse
                )
                .filter(
                        Objects::nonNull
                )
                .toList();

    }

    @Override
    public List<VendorListingResponse>
    getWeddingVideography() {

        return vendorServiceRepository
                .findByDiscoveryTagAndActiveTrueAndDeletedFalse(
                        ServiceDiscoveryTag.WEDDING_VIDEOGRAPHY
                )
                .stream()
                .map(
                        this::toVendorListingResponse
                )
                .filter(
                        Objects::nonNull
                )
                .toList();

    }


    private VendorListingResponse toVendorListingResponse(
            VendorService service
    ) {

        User vendor =
                vendorRepository
                        .findById(
                                service.getVendorId()
                        )
                        .orElse(null);


        /*
         * Vendor no longer exists
         */

        if (vendor == null) {

            return null;

        }


        /*
         * Only approved vendors should appear
         * on the customer home page.
         */

        if (
                vendor.getVerificationStatus()
                        != VendorVerificationStatus.APPROVED
        ) {

            return null;

        }


        /*
         * Only approved services should appear.
         */

        if (
                service.getModerationStatus()
                        != ServiceModerationStatus.APPROVED
        ) {

            return null;

        }


        /*
         * Extra safety check.
         *
         * Repository already checks active=true
         * and deleted=false, but keeping this
         * makes the method reusable.
         */

        if (
                !Boolean.TRUE.equals(
                        service.getActive()
                )
                        ||
                        Boolean.TRUE.equals(
                                service.getDeleted()
                        )
        ) {

            return null;

        }


        return customerVendorMapper.toListing(
                vendor,
                service
        );

    }
}