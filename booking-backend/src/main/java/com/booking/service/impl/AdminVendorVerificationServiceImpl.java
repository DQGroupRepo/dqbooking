package com.booking.service.impl;

import com.booking.dto.admin.AdminVendorServiceResponse;
import com.booking.dto.admin.AdminVendorVerificationResponse;
import com.booking.exception.VendorNotFoundException;
import com.booking.exception.VendorServiceNotFoundException;
import com.booking.model.User;
import com.booking.model.VendorService;
import com.booking.model.enums.Role;
import com.booking.model.enums.ServiceDiscoveryTag;
import com.booking.model.enums.ServiceModerationStatus;
import com.booking.model.enums.VendorVerificationStatus;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.AdminVendorVerificationService;
import com.booking.service.VendorSettingsApprovalService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminVendorVerificationServiceImpl
        implements AdminVendorVerificationService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    AdminVendorVerificationServiceImpl.class
            );

    private final UserRepository userRepository;

    private final VendorServiceRepository
            vendorServiceRepository;

    private final VendorSettingsApprovalService settingsApprovalService;

    @Override
    public List<AdminVendorVerificationResponse> getVendors() {

        log.info(
                "Admin requested vendor verification list"
        );

        List<User> vendors =
                userRepository.findByRole(
                        Role.VENDOR_ADMIN
                );

        List<AdminVendorVerificationResponse> responses =
                vendors.stream()
                        .map(this::buildResponse)
                        .toList();

        log.info(
                "Admin vendor verification list retrieved count={}",
                responses.size()
        );

        return responses;
    }

    @Override
    public AdminVendorVerificationResponse getVendor(
            String vendorId
    ) {

        log.info(
                "Admin requested vendor verification details vendorId={}",
                vendorId
        );

        User vendor =
                getVendorEntity(vendorId);

        return buildResponse(vendor);
    }

    private AdminVendorVerificationResponse buildResponse(
            User vendor
    ) {

        List<VendorService> services =
                vendorServiceRepository
                        .findByVendorIdAndDeletedFalse(
                                vendor.getId()
                        );

        List<AdminVendorServiceResponse>
                serviceResponses =
                services.stream()
                        .map(this::buildServiceResponse)
                        .toList();

        return AdminVendorVerificationResponse
                .builder()

                .vendorId(
                        vendor.getId()
                )

                .businessName(
                        vendor.getBusinessName()
                )

                .ownerName(
                        vendor.getFullName()
                )

                .email(
                        vendor.getEmail()
                )

                .phone(
                        vendor.getPhone()
                )

                .city(
                        vendor.getCity()
                )

                .address(
                        vendor.getAddress()
                )

                .verificationStatus(
                        vendor.getVerificationStatus()
                )

                .pendingSettingsCount(
                        settingsApprovalService.pendingCounts(List.of(vendor.getId())).getOrDefault(vendor.getId(), 0L)
                )

                .services(
                        serviceResponses
                )

                .build();
    }

    private AdminVendorServiceResponse
    buildServiceResponse(
            VendorService service
    ) {

        return AdminVendorServiceResponse
                .builder()

                .serviceId(
                        service.getId()
                )

                .serviceName(
                        service.getServiceName()
                )

                .category(
                        service.getCategory() != null
                                ? service.getCategory().name()
                                : null
                )

                .moderationStatus(
                        service.getModerationStatus()
                )

                .active(
                        service.getActive()
                )

                .deleted(
                        service.getDeleted()
                )

                .discoveryTags(
                        service.getDiscoveryTags()
                )

                .build();
    }

    @Override
    public void approveVendor(
            String vendorId
    ) {

        log.info(
                "Admin approving vendor vendorId={}",
                vendorId
        );

        User vendor =
                getVendorEntity(vendorId);

        vendor.setVerificationStatus(
                VendorVerificationStatus.APPROVED
        );

        userRepository.save(vendor);

        log.info(
                "Vendor approved vendorId={}",
                vendorId
        );
    }

    @Override
    public void rejectVendor(
            String vendorId
    ) {

        log.info(
                "Admin rejecting vendor vendorId={}",
                vendorId
        );

        User vendor =
                getVendorEntity(vendorId);

        vendor.setVerificationStatus(
                VendorVerificationStatus.REJECTED
        );

        userRepository.save(vendor);

        log.info(
                "Vendor rejected vendorId={}",
                vendorId
        );
    }

    @Override
    public void suspendVendor(
            String vendorId
    ) {

        log.info(
                "Admin suspending vendor vendorId={}",
                vendorId
        );

        User vendor =
                getVendorEntity(vendorId);

        vendor.setVerificationStatus(
                VendorVerificationStatus.SUSPENDED
        );

        userRepository.save(vendor);

        log.info(
                "Vendor suspended vendorId={}",
                vendorId
        );
    }

    @Override
    public void reactivateVendor(
            String vendorId
    ) {

        log.info(
                "Admin reactivating vendor vendorId={}",
                vendorId
        );

        User vendor =
                getVendorEntity(vendorId);

        vendor.setVerificationStatus(
                VendorVerificationStatus.APPROVED
        );

        userRepository.save(vendor);

        log.info(
                "Vendor reactivated vendorId={}",
                vendorId
        );
    }

    private User getVendorEntity(
            String vendorId
    ) {

        return userRepository
                .findById(vendorId)
                .filter(user ->
                        user.getRole() == Role.VENDOR_ADMIN
                )
                .orElseThrow(() -> {

                    log.warn(
                            "Vendor not found or invalid vendor role vendorId={}",
                            vendorId
                    );

                    return new VendorNotFoundException(
                            vendorId
                    );
                });
    }

    @Override
    public void updateServiceDiscoveryTags(
            String serviceId,
            Set<ServiceDiscoveryTag> tags
    ) {

        log.info(
                "Admin updating service discovery tags serviceId={}",
                serviceId
        );

        VendorService service =
                vendorServiceRepository
                        .findById(serviceId)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Service not found while updating discovery tags serviceId={}",
                                    serviceId
                            );

                            return new VendorServiceNotFoundException(
                                    "Service not found: "
                                            + serviceId
                            );
                        });

        if (Boolean.TRUE.equals(
                service.getDeleted()
        )) {

            log.warn(
                    "Discovery tags update rejected for deleted service serviceId={}",
                    serviceId
            );

            throw new IllegalStateException(
                    "Deleted service cannot be updated."
            );
        }

        service.setDiscoveryTags(
                tags == null
                        ? new HashSet<>()
                        : new HashSet<>(tags)
        );

        vendorServiceRepository.save(
                service
        );

        log.info(
                "Service discovery tags updated serviceId={} vendorId={} tagCount={}",
                serviceId,
                service.getVendorId(),
                tags == null ? 0 : tags.size()
        );
    }
}