package com.booking.service.impl;

import com.booking.dto.bundle.BundleCalculationItemRequest;
import com.booking.dto.bundle.BundleCalculationRequest;
import com.booking.dto.bundle.BundleCalculationResponse;
import com.booking.dto.bundle.BundleDiscountItem;
import com.booking.exception.ResourceNotFoundException;
import com.booking.exception.VendorServiceNotFoundException;
import com.booking.model.Bundle;
import com.booking.model.VendorService;
import com.booking.model.embedded.ServicePackage;
import com.booking.model.enums.DiscountType;
import com.booking.repository.BundleRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.BundleCalculationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BundleCalculationServiceImpl
        implements BundleCalculationService {

    private static final Logger log =
            LoggerFactory.getLogger(BundleCalculationServiceImpl.class);

    private final VendorServiceRepository vendorServiceRepository;

    private final BundleRepository bundleRepository;

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
                        .findById(
                                request.getBundleId()
                        )
                        .orElseThrow(() -> {

                            log.warn(
                                    "Bundle calculation failed. Bundle not found bundleId={}",
                                    request.getBundleId()
                            );

                            return new ResourceNotFoundException(
                                    "Bundle not found: "
                                            + request.getBundleId()
                            );
                        });

        List<BundleCalculationItemRequest> requestItems =
                request.getItems();

        if (
                requestItems == null ||
                        requestItems.isEmpty()
        ) {

            log.debug(
                    "Bundle calculation has no service items bundleId={}",
                    request.getBundleId()
            );

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

        log.debug(
                "Bundle services loaded bundleId={} serviceCount={}",
                bundle.getId(),
                serviceMap.size()
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

                                log.warn(
                                        "Bundle calculation service not found serviceId={}",
                                        item.getServiceId()
                                );

                                throw new VendorServiceNotFoundException(
                                        "Service not found: "
                                                + item.getServiceId()
                                );
                            }

                            if (
                                    !bundle
                                            .getServiceIds()
                                            .contains(
                                                    service.getId()
                                            )
                            ) {

                                log.warn(
                                        "Service does not belong to bundle serviceId={} bundleId={}",
                                        service.getId(),
                                        bundle.getId()
                                );

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
                                            item.getPackageId()
                                    );

                            return new BundleCalculationLine(
                                    service,
                                    selectedPackage
                            );
                        })
                        .toList();

        if (lines.isEmpty()) {

            log.debug(
                    "Bundle calculation produced no qualifying lines bundleId={}",
                    bundle.getId()
            );

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

            log.warn(
                    "Bundle calculation rejected because services belong to different vendors bundleId={}",
                    bundle.getId()
            );

            throw new IllegalArgumentException(
                    "All services in a bundle must belong to the same vendor."
            );
        }

        int qualifyingServiceCount =
                lines.size();

        boolean bundleApplied =
                qualifyingServiceCount >= 2;

        BigDecimal originalTotal =
                lines.stream()
                        .map(line -> {

                            if (
                                    line.selectedPackage()
                                            != null
                            ) {

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

        BigDecimal totalDiscount =
                BigDecimal.ZERO;

        if (bundleApplied) {

            BigDecimal discountValue =
                    safe(
                            bundle.getDiscountValue()
                    );

            if (
                    "PERCENTAGE".equalsIgnoreCase(
                            bundle.getDiscountType()
                    )
            ) {

                totalDiscount =
                        originalTotal
                                .multiply(
                                        discountValue
                                )
                                .divide(
                                        BigDecimal.valueOf(100),
                                        2,
                                        RoundingMode.HALF_UP
                                );

            } else if (
                    "FIXED".equalsIgnoreCase(
                            bundle.getDiscountType()
                    )
            ) {

                totalDiscount =
                        discountValue.min(
                                originalTotal
                        );
            }
        }

        List<BundleDiscountItem> resultItems =
                new ArrayList<>();

        BigDecimal finalTotal =
                originalTotal.subtract(
                        totalDiscount
                );

        for (
                BundleCalculationLine line :
                lines
        ) {

            VendorService service =
                    line.service();

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

            if (
                    bundleApplied &&
                            originalTotal.compareTo(
                                    BigDecimal.ZERO
                            ) > 0
            ) {

                itemDiscount =
                        totalDiscount
                                .multiply(
                                        originalAmount
                                )
                                .divide(
                                        originalTotal,
                                        2,
                                        RoundingMode.HALF_UP
                                );
            }

            BigDecimal itemFinalAmount =
                    originalAmount
                            .subtract(
                                    itemDiscount
                            )
                            .max(
                                    BigDecimal.ZERO
                            );

            resultItems.add(
                    BundleDiscountItem.builder()
                            .serviceId(
                                    service.getId()
                            )
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

        log.info(
                "Bundle calculation completed bundleId={} vendorId={} serviceCount={} bundleApplied={}",
                bundle.getId(),
                vendorId,
                qualifyingServiceCount,
                bundleApplied
        );

        return BundleCalculationResponse.builder()
                .bundleApplied(
                        bundleApplied
                )
                .vendorId(
                        vendorId
                )
                .qualifyingServiceCount(
                        qualifyingServiceCount
                )
                .originalTotal(
                        originalTotal
                )
                .totalDiscount(
                        totalDiscount
                )
                .finalTotal(
                        finalTotal
                )
                .items(
                        resultItems
                )
                .build();
    }

    private VendorService getService(
            String serviceId
    ) {

        return vendorServiceRepository
                .findByIdAndDeletedFalse(
                        serviceId
                )
                .orElseThrow(() -> {

                    log.warn(
                            "Bundle calculation service not found serviceId={}",
                            serviceId
                    );

                    return new VendorServiceNotFoundException(
                            "Service not found: "
                                    + serviceId
                    );
                });
    }

    private ServicePackage resolvePackage(
            VendorService service,
            String packageId
    ) {

        if (
                packageId == null ||
                        packageId.isBlank()
        ) {
            return null;
        }

        List<ServicePackage> packages =
                service.getPackages() == null
                        ? List.of()
                        : service.getPackages();

        ServicePackage selectedPackage =
                packages
                        .stream()
                        .filter(
                                pkg ->
                                        pkg.getId()
                                                .equals(
                                                        packageId
                                                )
                        )
                        .findFirst()
                        .orElseThrow(() -> {

                            log.warn(
                                    "Selected package not found serviceId={} packageId={}",
                                    service.getId(),
                                    packageId
                            );

                            return new VendorServiceNotFoundException(
                                    "Selected package not found: "
                                            + packageId
                            );
                        });

        if (!selectedPackage.isActive()) {

            log.warn(
                    "Selected package is inactive serviceId={} packageId={}",
                    service.getId(),
                    packageId
            );

            throw new IllegalArgumentException(
                    "Selected package is not active."
            );
        }

        return selectedPackage;
    }

    private BigDecimal calculateDiscount(
            BigDecimal originalAmount,
            VendorService service
    ) {

        if (
                service.getBundleDiscountValue() == null ||
                        service.getBundleDiscountType() == null
        ) {
            return BigDecimal.ZERO;
        }

        BigDecimal value =
                service.getBundleDiscountValue();

        if (
                value.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {
            return BigDecimal.ZERO;
        }

        if (
                service.getBundleDiscountType()
                        == DiscountType.PERCENTAGE
        ) {

            return originalAmount
                    .multiply(value)
                    .divide(
                            BigDecimal.valueOf(100),
                            2,
                            RoundingMode.HALF_UP
                    );
        }

        if (
                service.getBundleDiscountType()
                        == DiscountType.FIXED
        ) {

            return value.min(
                    originalAmount
            );
        }

        return BigDecimal.ZERO;
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