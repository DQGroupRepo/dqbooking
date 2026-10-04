package com.booking.service.impl;

import com.booking.dto.customer.VendorDetailResponse;
import com.booking.dto.customer.VendorListingResponse;
import com.booking.dto.customer.VendorPricingForDateResponse;
import com.booking.exception.ServiceNotFoundException;
import com.booking.exception.VendorNotFoundException;
import com.booking.mapper.CustomerVendorMapper;
import com.booking.model.User;
import com.booking.model.VendorService;
import com.booking.model.VendorServicePricing;
import com.booking.model.enums.*;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorServicePricingRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl
        implements CustomerService {

    private static final Logger log =
            LoggerFactory.getLogger(CustomerServiceImpl.class);

    private final VendorServiceRepository vendorServiceRepository;

    private final UserRepository vendorRepository;

    private final CustomerVendorMapper customerVendorMapper;

    private final VendorServicePricingRepository
            vendorServicePricingRepository;

    @Override
    public VendorDetailResponse getServiceById(
            String serviceId
    ) {

        log.debug(
                "Customer requested service details serviceId={}",
                serviceId
        );

        VendorService service =
                vendorServiceRepository
                        .findById(serviceId)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Customer service lookup failed. Service not found serviceId={}",
                                    serviceId
                            );

                            return new ServiceNotFoundException(
                                    serviceId
                            );
                        });

        User vendor =
                vendorRepository
                        .findById(service.getVendorId())
                        .orElseThrow(() -> {

                            log.warn(
                                    "Customer service lookup failed. Vendor not found vendorId={} serviceId={}",
                                    service.getVendorId(),
                                    serviceId
                            );

                            return new VendorNotFoundException(
                                    service.getVendorId()
                            );
                        });

        if (vendor.getVerificationStatus()
                != VendorVerificationStatus.APPROVED) {

            log.debug(
                    "Service hidden because vendor is not approved serviceId={} vendorId={}",
                    serviceId,
                    service.getVendorId()
            );

            throw new ServiceNotFoundException(serviceId);
        }

        if (service.getModerationStatus()
                != ServiceModerationStatus.APPROVED) {

            log.debug(
                    "Service hidden because moderation is not approved serviceId={}",
                    serviceId
            );

            throw new ServiceNotFoundException(serviceId);
        }

        if (!Boolean.TRUE.equals(service.getActive())
                || Boolean.TRUE.equals(service.getDeleted())) {

            log.debug(
                    "Service hidden because it is inactive or deleted serviceId={}",
                    serviceId
            );

            throw new ServiceNotFoundException(serviceId);
        }

        log.info(
                "Customer service details returned serviceId={} vendorId={}",
                serviceId,
                service.getVendorId()
        );

        return customerVendorMapper.toDetail(
                vendor,
                service, null
        );
    }

    @Override
    public List<VendorListingResponse> getVendorListings(
            String category
    ) {

        log.debug(
                "Customer vendor listing requested category={}",
                category
        );

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

        List<VendorListingResponse> responses =
                services.stream()
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
                        .filter(Objects::nonNull)
                        .toList();

        log.info(
                "Customer vendor listings returned category={} count={}",
                category,
                responses.size()
        );

        return responses;
    }

    @Override
    public List<VendorListingResponse> getFeaturedServices() {

        log.debug(
                "Customer featured services requested"
        );

        List<VendorListingResponse> responses =
                vendorServiceRepository
                        .findByDiscoveryTagAndActiveTrueAndDeletedFalse(
                                ServiceDiscoveryTag.FEATURED
                        )
                        .stream()
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
                        .filter(Objects::nonNull)
                        .toList();

        log.info(
                "Customer featured services returned count={}",
                responses.size()
        );

        return responses;
    }

    @Override
    public List<VendorListingResponse> getPopularHalls() {

        log.debug(
                "Customer popular halls requested"
        );

        List<VendorListingResponse> responses =
                vendorServiceRepository
                        .findByDiscoveryTagAndActiveTrueAndDeletedFalse(
                                ServiceDiscoveryTag.POPULAR_HALL
                        )
                        .stream()
                        .map(this::toVendorListingResponse)
                        .filter(Objects::nonNull)
                        .toList();

        log.info(
                "Customer popular halls returned count={}",
                responses.size()
        );

        return responses;
    }

    @Override
    public List<VendorListingResponse> getTopBridalMakeup() {

        log.debug(
                "Customer top bridal makeup requested"
        );

        List<VendorListingResponse> responses =
                vendorServiceRepository
                        .findByDiscoveryTagAndActiveTrueAndDeletedFalse(
                                ServiceDiscoveryTag.TOP_BRIDAL_MAKEUP
                        )
                        .stream()
                        .map(this::toVendorListingResponse)
                        .filter(Objects::nonNull)
                        .toList();

        log.info(
                "Customer top bridal makeup returned count={}",
                responses.size()
        );

        return responses;
    }

    @Override
    public List<VendorListingResponse>
    getProfessionalPhotography() {

        log.debug(
                "Customer professional photography requested"
        );

        List<VendorListingResponse> responses =
                vendorServiceRepository
                        .findByDiscoveryTagAndActiveTrueAndDeletedFalse(
                                ServiceDiscoveryTag.PROFESSIONAL_PHOTOGRAPHY
                        )
                        .stream()
                        .map(this::toVendorListingResponse)
                        .filter(Objects::nonNull)
                        .toList();

        log.info(
                "Customer professional photography returned count={}",
                responses.size()
        );

        return responses;
    }

    @Override
    public List<VendorListingResponse>
    getWeddingVideography() {

        log.debug(
                "Customer wedding videography requested"
        );

        List<VendorListingResponse> responses =
                vendorServiceRepository
                        .findByDiscoveryTagAndActiveTrueAndDeletedFalse(
                                ServiceDiscoveryTag.WEDDING_VIDEOGRAPHY
                        )
                        .stream()
                        .map(this::toVendorListingResponse)
                        .filter(Objects::nonNull)
                        .toList();

        log.info(
                "Customer wedding videography returned count={}",
                responses.size()
        );

        return responses;
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

        if (vendor == null) {

            log.debug(
                    "Skipping service because vendor no longer exists serviceId={} vendorId={}",
                    service.getId(),
                    service.getVendorId()
            );

            return null;
        }

        if (
                vendor.getVerificationStatus()
                        != VendorVerificationStatus.APPROVED
        ) {

            return null;
        }

        if (
                service.getModerationStatus()
                        != ServiceModerationStatus.APPROVED
        ) {

            return null;
        }

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

    public VendorPricingForDateResponse getPricingForEventDate(
            String serviceId,
            LocalDate eventDate
    ) {

        List<VendorServicePricing> pricingVersions =
                vendorServicePricingRepository
                        .findApplicablePricing(
                                serviceId,
                                eventDate
                        );

        VendorServicePricing pricing =
                pricingVersions.stream()
                        .sorted(
                                Comparator
                                        .comparing(
                                                VendorServicePricing::getVersion,
                                                Comparator.nullsLast(
                                                        Comparator.reverseOrder()
                                                )
                                        )
                                        .thenComparing(
                                                VendorServicePricing::getLastUpdateTs,
                                                Comparator.nullsLast(
                                                        Comparator.reverseOrder()
                                                )
                                        )
                        )
                        .findFirst()
                        .orElse(null);

        if (pricing == null) {
            return VendorPricingForDateResponse.builder()
                    .eventDate(eventDate)
                    .packages(Collections.emptyList())
                    .build();
        }

        return VendorPricingForDateResponse.builder()

                .pricingId(
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

                .eventDate(
                        eventDate
                )

                .packages(
                        pricing.getPackages() == null
                                ? Collections.emptyList()
                                : pricing.getPackages()
                )

                .build();
    }

}