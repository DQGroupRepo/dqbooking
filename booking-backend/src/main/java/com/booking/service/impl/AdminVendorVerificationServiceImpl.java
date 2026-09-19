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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminVendorVerificationServiceImpl
        implements AdminVendorVerificationService {

    private final UserRepository userRepository;

    private final VendorServiceRepository
            vendorServiceRepository;

    @Override
    public List<AdminVendorVerificationResponse> getVendors() {

        List<User> vendors =
                userRepository.findByRole(
                        Role.VENDOR_ADMIN
                );

        return vendors.stream()
                .map(this::buildResponse)
                .toList();
    }

    @Override
    public AdminVendorVerificationResponse getVendor(
            String vendorId
    ) {

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

        User vendor =
                getVendorEntity(vendorId);

        vendor.setVerificationStatus(
                VendorVerificationStatus.APPROVED
        );

        userRepository.save(vendor);
    }

    @Override
    public void rejectVendor(
            String vendorId
    ) {

        User vendor =
                getVendorEntity(vendorId);

        vendor.setVerificationStatus(
                VendorVerificationStatus.REJECTED
        );

        userRepository.save(vendor);
    }

    @Override
    public void suspendVendor(
            String vendorId
    ) {

        User vendor =
                getVendorEntity(vendorId);

        vendor.setVerificationStatus(
                VendorVerificationStatus.SUSPENDED
        );

        userRepository.save(vendor);
    }

    @Override
    public void reactivateVendor(
            String vendorId
    ) {

        User vendor =
                getVendorEntity(vendorId);

        vendor.setVerificationStatus(
                VendorVerificationStatus.APPROVED
        );

        userRepository.save(vendor);
    }

    private User getVendorEntity(
            String vendorId
    ) {

        User vendor =
                userRepository
                        .findById(vendorId)
                        .orElseThrow(() ->
                                new VendorNotFoundException(
                                        vendorId
                                )
                        );

        if (vendor.getRole() != Role.VENDOR_ADMIN) {

            throw new VendorNotFoundException(
                    vendorId
            );
        }

        return vendor;
    }

    @Override
    public void updateServiceDiscoveryTags(
            String serviceId,
            Set<ServiceDiscoveryTag> tags
    ) {

        VendorService service =
                vendorServiceRepository
                        .findById(serviceId)
                        .orElseThrow(() ->
                                new VendorServiceNotFoundException(
                                        "Service not found: "
                                                + serviceId
                                )
                        );

        if (Boolean.TRUE.equals(
                service.getDeleted()
        )) {

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
    }
}