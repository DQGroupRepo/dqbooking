package com.booking.service.impl;

import com.booking.dto.bundle.BundleCalculationItemRequest;
import com.booking.dto.bundle.BundleCalculationRequest;
import com.booking.dto.bundle.BundleCalculationResponse;
import com.booking.dto.bundle.BundleDiscountItem;
import com.booking.exception.ResourceNotFoundException;
import com.booking.exception.VendorServiceNotFoundException;
import com.booking.model.Bundle;
import com.booking.model.VendorService;
import com.booking.model.VendorServicePricing;
import com.booking.model.embedded.ServicePackage;
import com.booking.repository.BundleRepository;
import com.booking.repository.VendorServicePricingRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.BundleCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BundleCalculationServiceImpl
        implements BundleCalculationService {

    private final VendorServiceRepository vendorServiceRepository;

    private final BundleRepository bundleRepository;

    private final VendorServicePricingRepository
            vendorServicePricingRepository;

    @Override
    public BundleCalculationResponse calculateBundle(
            BundleCalculationRequest request
    ) {

        log.debug(
                "Starting bundle calculation bundleId={} itemCount={}",
                request.getBundleId(),
                request.getItems() == null
                        ? 0
                        : request.getItems().size()
        );

        Bundle bundle =
                bundleRepository
                        .findById(request.getBundleId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bundle not found: "
                                                + request.getBundleId()
                                )
                        );

        List<BundleCalculationItemRequest> requestItems =
                request.getItems();

        if (requestItems == null || requestItems.isEmpty()) {

            return BundleCalculationResponse.builder()
                    .bundleApplied(false)
                    .qualifyingServiceCount(0)
                    .originalTotal(BigDecimal.ZERO)
                    .totalDiscount(BigDecimal.ZERO)
                    .finalTotal(BigDecimal.ZERO)
                    .items(List.of())
                    .build();
        }

        Map<String, VendorService> serviceMap =
                requestItems
                        .stream()
                        .map(
                                BundleCalculationItemRequest
                                        ::getServiceId
                        )
                        .distinct()
                        .map(this::getService)
                        .collect(
                                Collectors.toMap(
                                        VendorService::getId,
                                        service -> service
                                )
                        );

        List<BundleCalculationLine> lines =
                requestItems
                        .stream()
                        .map(item -> {

                            VendorService service =
                                    serviceMap.get(
                                            item.getServiceId()
                                    );

                            if (service == null) {
                                throw new VendorServiceNotFoundException(
                                        "Service not found: "
                                                + item.getServiceId()
                                );
                            }

                            if (!bundle.getServiceIds()
                                    .contains(service.getId())) {

                                throw new IllegalArgumentException(
                                        "Service "
                                                + service.getId()
                                                + " does not belong to bundle "
                                                + bundle.getId()
                                );
                            }

                            ServicePackage selectedPackage =
                                    resolvePackage(
                                            service,
                                            item.getPackageId(),
                                            item.getBookingFrom().toLocalDate()
                                    );

                            return new BundleCalculationLine(
                                    service,
                                    selectedPackage
                            );
                        })
                        .toList();

        if (lines.isEmpty()) {

            return BundleCalculationResponse.builder()
                    .bundleApplied(false)
                    .qualifyingServiceCount(0)
                    .originalTotal(BigDecimal.ZERO)
                    .totalDiscount(BigDecimal.ZERO)
                    .finalTotal(BigDecimal.ZERO)
                    .items(List.of())
                    .build();
        }

        String vendorId =
                lines.get(0)
                        .service()
                        .getVendorId();

        boolean sameVendor =
                lines.stream()
                        .allMatch(
                                line ->
                                        line.service()
                                                .getVendorId()
                                                .equals(vendorId)
                        );

        if (!sameVendor) {
            throw new IllegalArgumentException(
                    "All services in a bundle must belong to the same vendor."
            );
        }

        int qualifyingServiceCount = lines.size();

        boolean bundleApplied =
                qualifyingServiceCount >= 2;

        BigDecimal originalTotal =
                lines.stream()
                        .map(line -> {

                            if (line.selectedPackage() != null) {
                                return safe(
                                        line.selectedPackage()
                                                .getPrice()
                                );
                            }

                            return safe(
                                    line.service()
                                            .getStartingPrice()
                            );
                        })
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalDiscount = BigDecimal.ZERO;

        if (bundleApplied) {

            BigDecimal discountValue =
                    safe(bundle.getDiscountValue());

            if ("PERCENTAGE".equalsIgnoreCase(
                    bundle.getDiscountType()
            )) {

                totalDiscount =
                        originalTotal
                                .multiply(discountValue)
                                .divide(
                                        BigDecimal.valueOf(100),
                                        2,
                                        RoundingMode.HALF_UP
                                );

            } else if ("FIXED".equalsIgnoreCase(
                    bundle.getDiscountType()
            )) {

                totalDiscount =
                        discountValue.min(originalTotal);
            }
        }

        List<BundleDiscountItem> resultItems =
                new ArrayList<>();

        BigDecimal finalTotal =
                originalTotal.subtract(totalDiscount)
                        .max(BigDecimal.ZERO);

        for (BundleCalculationLine line : lines) {

            VendorService service = line.service();

            ServicePackage selectedPackage =
                    line.selectedPackage();

            BigDecimal originalAmount =
                    selectedPackage != null
                            ? safe(
                            selectedPackage.getPrice()
                    )
                            : safe(
                            service.getStartingPrice()
                    );

            BigDecimal itemDiscount =
                    BigDecimal.ZERO;

            if (bundleApplied
                    && originalTotal.compareTo(
                    BigDecimal.ZERO
            ) > 0) {

                itemDiscount =
                        totalDiscount
                                .multiply(originalAmount)
                                .divide(
                                        originalTotal,
                                        2,
                                        RoundingMode.HALF_UP
                                );
            }

            BigDecimal itemFinalAmount =
                    originalAmount
                            .subtract(itemDiscount)
                            .max(BigDecimal.ZERO);

            resultItems.add(
                    BundleDiscountItem.builder()
                            .serviceId(service.getId())
                            .serviceName(
                                    service.getServiceName()
                            )
                            .vendorId(
                                    service.getVendorId()
                            )
                            .originalAmount(
                                    originalAmount
                            )
                            .discountValue(
                                    bundle.getDiscountValue()
                            )
                            .discountAmount(
                                    itemDiscount
                            )
                            .finalAmount(
                                    itemFinalAmount
                            )
                            .bundleApplied(
                                    itemDiscount.compareTo(
                                            BigDecimal.ZERO
                                    ) > 0
                            )
                            .build()
            );
        }

        return BundleCalculationResponse.builder()
                .bundleApplied(bundleApplied)
                .vendorId(vendorId)
                .qualifyingServiceCount(
                        qualifyingServiceCount
                )
                .originalTotal(originalTotal)
                .totalDiscount(totalDiscount)
                .finalTotal(finalTotal)
                .items(resultItems)
                .build();
    }

    private VendorService getService(
            String serviceId
    ) {

        return vendorServiceRepository
                .findByIdAndDeletedFalse(serviceId)
                .orElseThrow(() ->
                        new VendorServiceNotFoundException(
                                "Service not found: "
                                        + serviceId
                        )
                );
    }

    private ServicePackage resolvePackage(
            VendorService service,
            String packageId,
            LocalDate eventDate
    ) {

        if (packageId == null || packageId.isBlank()) {
            return null;
        }

        VendorServicePricing pricing =
                vendorServicePricingRepository
                        .findByServiceIdOrderByVersionDesc(
                                service.getId()
                        )
                        .stream()
                        .filter(candidate ->
                                isPricingApplicable(
                                        candidate,
                                        eventDate
                                )
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new VendorServiceNotFoundException(
                                        "No applicable pricing found for service: "
                                                + service.getId()
                                )
                        );

        List<ServicePackage> packages =
                pricing.getPackages() == null
                        ? List.of()
                        : pricing.getPackages();

        ServicePackage selectedPackage =
                packages
                        .stream()
                        .filter(pkg ->
                                packageId.equals(pkg.getId())
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new VendorServiceNotFoundException(
                                        "Selected package not found: "
                                                + packageId
                                )
                        );

        if (!selectedPackage.isActive()) {
            throw new IllegalArgumentException(
                    "Selected package is not active."
            );
        }

        return selectedPackage;
    }

    private boolean isPricingApplicable(
            VendorServicePricing pricing,
            LocalDate eventDate
    ) {

        if (eventDate == null) {
            return true;
        }

        if (pricing.getEffectiveFrom() != null
                && eventDate.isBefore(
                pricing.getEffectiveFrom()
        )) {
            return false;
        }

        if (pricing.getEffectiveUntil() != null
                && eventDate.isAfter(
                pricing.getEffectiveUntil()
        )) {
            return false;
        }

        return true;
    }

    private BigDecimal safe(
            BigDecimal value
    ) {
        return value == null
                ? BigDecimal.ZERO
                : value;
    }

    private record BundleCalculationLine(
            VendorService service,
            ServicePackage selectedPackage
    ) {
    }
}
