package com.booking.service.impl;

import com.booking.dto.customer.EventPricingResponse;
import com.booking.dto.customer.VendorPricingForDateResponse;
import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.service.ServicePackageRequest;
import com.booking.dto.pricing.VendorServicePricingResponse;
import com.booking.dto.pricing.VendorServicePricingVersionResponse;
import com.booking.exception.ResourceNotFoundException;
import com.booking.exception.VendorServiceNotFoundException;
import com.booking.mapper.PricingMapper;
import com.booking.model.VendorService;
import com.booking.model.VendorServicePricing;
import com.booking.model.enums.ServiceCategory;
import com.booking.repository.VendorServicePricingRepository;
import com.booking.repository.UserRepository;
import com.booking.model.User;
import org.bson.types.ObjectId;
import com.booking.repository.BookingSlotRepository;
import com.booking.model.BookingSlot;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.VendorAccessService;
import com.booking.service.VendorServicePricingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorServicePricingServiceImpl
        implements VendorServicePricingService {

    private final VendorServicePricingRepository
            vendorServicePricingRepository;

    private final UserRepository userRepository;

    private final VendorServiceRepository
            vendorServiceRepository;

    private final BookingSlotRepository bookingSlotRepository;

    private final PricingMapper pricingMapper;

    private final VendorAccessService
            vendorAccessService;


    @Override
    public VendorServicePricingResponse createPricing(
            VendorServicePricingRequest request
    ) {

        log.info(
                "Creating pricing configuration serviceId={}",
                request.getServiceId()
        );

        VendorService service =
                getService(
                        request.getServiceId()
                );

        validateVendorOwnership(
                service
        );

        validatePackageReferences(service, request.getPackages());

        VendorServicePricing pricing =
                pricingMapper.toEntity(
                        request
                );

        pricing.setVendorId(
                service.getVendorId()
        );

        pricing.setServiceId(
                service.getId()
        );


        /*
         * =========================================
         * VERSION
         * =========================================
         *
         * A save always creates a new immutable
         * pricing version.
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
         * =========================================
         * AUDIT
         * =========================================
         *
         * These values are generated server-side.
         * They must not come from the request body.
         */
        pricing.setCreatedAt(
                Instant.now()
        );

        pricing.setCreatedBy(
                getCurrentUserId()
        );


        VendorServicePricing savedPricing =
                vendorServicePricingRepository
                        .save(
                                pricing
                        );


        syncStartingPrice(
                savedPricing.getServiceId(),
                savedPricing.getBaseAmount()
        );


        log.info(
                "Pricing configuration created pricingId={} serviceId={} vendorId={} version={} createdBy={}",
                savedPricing.getId(),
                savedPricing.getServiceId(),
                savedPricing.getVendorId(),
                savedPricing.getVersion(),
                savedPricing.getCreatedBy()
        );


        return pricingMapper.toResponse(
                savedPricing
        );
    }


    /*
     * =========================================
     * GET VERSION HISTORY
     * =========================================
     */
    @Override
    public List<VendorServicePricingVersionResponse>
    getPricingVersions(
            String serviceId
    ) {

        log.info(
                "Retrieving pricing versions serviceId={}",
                serviceId
        );


        VendorService service =
                getService(
                        serviceId
                );

        validateVendorOwnership(
                service
        );


        return vendorServicePricingRepository
                .findByServiceIdOrderByVersionDesc(
                        serviceId
                )
                .stream()
                .map(
                        pricing ->
                                VendorServicePricingVersionResponse
                                        .builder()
                                        .id(
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
                                        .createdAt(
                                                pricing.getCreatedAt()
                                        )
                                        .createdBy(
                                                resolveCreatedByDisplay(pricing.getCreatedBy())
                                        )
                                        .build()
                )
                .toList();
    }


    private void syncStartingPrice(
            String serviceId,
            BigDecimal baseAmount
    ) {

        VendorService vendorService =
                vendorServiceRepository
                        .findById(
                                serviceId
                        )
                        .orElseThrow(() -> {

                            log.warn(
                                    "Service not found while synchronizing starting price serviceId={}",
                                    serviceId
                            );

                            return new VendorServiceNotFoundException(
                                    "Service not found"
                            );
                        });


        vendorService.setStartingPrice(
                baseAmount
        );


        vendorServiceRepository.save(
                vendorService
        );


        log.debug(
                "Vendor service starting price synchronized serviceId={}",
                serviceId
        );
    }


    @Override
    public VendorServicePricingResponse getPricingById(
            String pricingId
    ) {

        log.info(
                "Retrieving pricing configuration pricingId={}",
                pricingId
        );


        VendorServicePricing pricing =
                vendorServicePricingRepository
                        .findById(
                                pricingId
                        )
                        .orElseThrow(() -> {

                            log.warn(
                                    "Pricing configuration not found pricingId={}",
                                    pricingId
                            );

                            return new ResourceNotFoundException(
                                    "Pricing configuration not found."
                            );
                        });


        VendorService service =
                getService(
                        pricing.getServiceId()
                );

        validateVendorOwnership(
                service
        );


        log.info(
                "Pricing configuration retrieved pricingId={} serviceId={} version={}",
                pricingId,
                pricing.getServiceId(),
                pricing.getVersion()
        );


        return pricingMapper.toResponse(
                pricing
        );
    }


    @Override
    public VendorServicePricingResponse getCurrentPricing(
            String serviceId
    ) {

        log.info(
                "Retrieving current pricing serviceId={}",
                serviceId
        );


        VendorService service =
                getService(
                        serviceId
                );

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

            log.warn(
                    "No pricing configuration found for service serviceId={}",
                    serviceId
            );

            throw new ResourceNotFoundException(
                    "No pricing configuration found for this service."
            );
        }


        VendorServicePricing currentPricing =
                pricingVersions.get(0);


        log.info(
                "Current pricing retrieved serviceId={} pricingId={} version={}",
                serviceId,
                currentPricing.getId(),
                currentPricing.getVersion()
        );


        return pricingMapper.toResponse(
                currentPricing,
                service
        );
    }


    private void validatePackageReferences(
            VendorService service,
            List<ServicePackageRequest> packages
    ) {
        if (packages == null || packages.isEmpty()) return;
        boolean isStay = service.getCategory() == ServiceCategory.STAY;

        for (ServicePackageRequest pkg : packages) {
            if (pkg == null || !pkg.isActive()) continue;
            if (pkg.getSlotIds() != null) {
                for (String slotId : pkg.getSlotIds()) {
                    if (slotId == null || slotId.isBlank()) continue;
                    BookingSlot slot = bookingSlotRepository.findById(slotId)
                            .filter(s -> service.getId().equals(s.getServiceId()))
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "A selected slot does not belong to this service."));
                    if (Boolean.FALSE.equals(slot.getActive())) {
                        throw new IllegalArgumentException("Inactive slots cannot be assigned to active packages.");
                    }
                }
            }
            if (!isStay && ((pkg.getResourceTypeId() != null && !pkg.getResourceTypeId().isBlank())
                    || (pkg.getResourceRequirements() != null && !pkg.getResourceRequirements().isEmpty()))) {
                throw new IllegalArgumentException("Resource Types and physical room allocation are supported only for STAY services.");
            }
            if (isStay) {
                if (pkg.getMaxGuestsPerRoom() == null || pkg.getMaxGuestsPerRoom() < 1) {
                    throw new IllegalArgumentException(
                            "Every active STAY package must define at least one guest per room.");
                }
                if (pkg.getSlotIds() == null || pkg.getSlotIds().isEmpty()) {
                    throw new IllegalArgumentException(
                            "Every active STAY package must be assigned to at least one booking slot.");
                }
                // Every active STAY package must consume one or more configured resource types.
                java.util.List<com.booking.model.embedded.ResourceTypeRequirement> requirements =
                        pkg.getResourceRequirements() == null ? new java.util.ArrayList<>()
                                : new java.util.ArrayList<>(pkg.getResourceRequirements());
                if (requirements.isEmpty() && pkg.getResourceTypeId() != null && !pkg.getResourceTypeId().isBlank()) {
                    com.booking.model.embedded.ResourceTypeRequirement legacy = new com.booking.model.embedded.ResourceTypeRequirement();
                    legacy.setResourceTypeId(pkg.getResourceTypeId());
                    legacy.setQuantity(1);
                    requirements.add(legacy);
                }
                if (requirements.isEmpty()) {
                    throw new IllegalArgumentException("Every active STAY package must include at least one Resource Type.");
                }
                java.util.Set<String> seen = new java.util.HashSet<>();
                for (var requirement : requirements) {
                    if (requirement.getResourceTypeId() == null || requirement.getResourceTypeId().isBlank()
                            || requirement.getQuantity() == null || requirement.getQuantity() < 1
                            || !seen.add(requirement.getResourceTypeId())) {
                        throw new IllegalArgumentException("Each package Resource Type must be unique and have a quantity of at least one.");
                    }
                    com.booking.model.embedded.ServiceResourceType configuredType = service.getResourceTypes() == null
                            ? null : service.getResourceTypes().stream()
                            .filter(type -> requirement.getResourceTypeId().equals(type.getId())
                                    && !Boolean.FALSE.equals(type.getActive()))
                            .findFirst().orElse(null);
                    if (configuredType == null)
                        throw new IllegalArgumentException("A package references an inactive or unknown Resource Type.");
                    if (configuredType.getQuantity() == null || requirement.getQuantity() > configuredType.getQuantity())
                        throw new IllegalArgumentException("A package cannot require more rooms of a type than the vendor has configured.");
                }
                pkg.setResourceRequirements(requirements);
                // STAY bookings always consume capacity from a selected booking slot.
                pkg.setRequiresSlot(true);
            }
        }
    }

    private VendorService getService(
            String serviceId
    ) {

        return vendorServiceRepository
                .findById(
                        serviceId
                )
                .orElseThrow(() -> {

                    log.warn(
                            "Vendor service not found serviceId={}",
                            serviceId
                    );

                    return new ResourceNotFoundException(
                            "Vendor service not found."
                    );
                });
    }


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

            log.warn(
                    "Vendor service access denied serviceId={} requestedVendorId={} ownerVendorId={}",
                    service.getId(),
                    effectiveVendorId,
                    service.getVendorId()
            );

            throw new AccessDeniedException(
                    "You do not have access to this service."
            );
        }
    }


    @Override
    public VendorServicePricingResponse getPricing(
            String pricingId
    ) {

        log.info(
                "Retrieving pricing pricingId={}",
                pricingId
        );


        VendorServicePricing pricing =
                vendorServicePricingRepository
                        .findById(
                                pricingId
                        )
                        .orElseThrow(() -> {

                            log.warn(
                                    "Pricing not found pricingId={}",
                                    pricingId
                            );

                            return new ResourceNotFoundException(
                                    "Pricing not found."
                            );
                        });


        VendorService service =
                getService(
                        pricing.getServiceId()
                );

        validateVendorOwnership(
                service
        );


        log.info(
                "Pricing retrieved pricingId={} serviceId={} version={}",
                pricingId,
                pricing.getServiceId(),
                pricing.getVersion()
        );


        return pricingMapper.toResponse(
                pricing,
                service
        );
    }


    /*
     * =========================================
     * CURRENT USER ID
     * =========================================
     *
     * This implementation uses the authenticated
     * principal name. In a JWT setup this is
     * normally the subject/user ID.
     */


    /**
     * Converts the audit user ID into a readable label for pricing history.
     * Older records may contain a Java object's default toString() value
     * (for example, com.booking.model.User@...); that value is not an ID and
     * cannot be resolved, so show a clear legacy label instead of leaking it.
     */
    private String resolveCreatedByDisplay(String createdBy) {
        if (createdBy == null || createdBy.isBlank()) {
            return "Unknown user";
        }

        String value = createdBy.trim();
        if (value.startsWith("com.booking.model.User@")) {
            return "Vendor (legacy record)";
        }

        if (ObjectId.isValid(value)) {
            return userRepository.findById(value)
                    .map(User::getFullName)
                    .filter(name -> name != null && !name.isBlank())
                    .orElseGet(() -> userRepository.findById(value)
                            .map(User::getEmail)
                            .filter(email -> email != null && !email.isBlank())
                            .orElse("Unknown user"));
        }

        // Preserve already-readable audit labels from older records.
        return value;
    }

    private String getCurrentUserId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        if (
                authentication == null ||
                        !authentication.isAuthenticated() ||
                        authentication.getPrincipal() == null ||
                        "anonymousUser".equals(
                                authentication.getPrincipal()
                                        .toString()
                        )
        ) {

            throw new AccessDeniedException(
                    "Authenticated user not found."
            );
        }


        String userId =
                authentication.getName();


        if (
                userId == null ||
                        userId.isBlank()
        ) {

            throw new AccessDeniedException(
                    "Authenticated user ID not found."
            );
        }


        return userId;
    }


}
