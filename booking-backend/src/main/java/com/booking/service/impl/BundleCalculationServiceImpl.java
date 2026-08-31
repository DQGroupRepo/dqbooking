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
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BundleCalculationServiceImpl
        implements BundleCalculationService {

    private final VendorServiceRepository vendorServiceRepository;
    private final BundleRepository bundleRepository;


    @Override
    public BundleCalculationResponse calculateBundle(
            BundleCalculationRequest request
    ) {

        /*
         * =========================================
         * 1. LOAD BUNDLE
         * =========================================
         */

        Bundle bundle =
                bundleRepository
                        .findById(
                                request.getBundleId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bundle not found: "
                                                + request.getBundleId()
                                )
                        );


        /*
         * =========================================
         * 2. LOAD SERVICES
         * =========================================
         */

        List<BundleCalculationItemRequest> requestItems =
                request.getItems();


        if (
                requestItems == null ||
                        requestItems.isEmpty()
        ) {

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


        /*
         * =========================================
         * 3. VERIFY BUNDLE SERVICES
         * =========================================
         */

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


                            /*
                             * Verify service belongs to bundle.
                             */

                            if (
                                    !bundle
                                            .getServiceIds()
                                            .contains(
                                                    service.getId()
                                            )
                            ) {

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


        /*
         * =========================================
         * 4. VERIFY SAME VENDOR
         * =========================================
         */

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
                                                .equals(
                                                        vendorId
                                                )
                        );


        if (!sameVendor) {

            throw new IllegalArgumentException(
                    "All services in a bundle must belong to the same vendor."
            );

        }


        /*
         * =========================================
         * 5. QUALIFICATION
         * =========================================
         */

        int qualifyingServiceCount =
                lines.size();


        boolean bundleApplied =
                qualifyingServiceCount >= 2;


        /*
         * =========================================
         * 6. ORIGINAL TOTAL
         * =========================================
         *
         * Package price is used when selected.
         * Otherwise normal service price is used.
         */

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
                                            .getPrice()
                            );

                        })
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        /*
         * =========================================
         * 7. CALCULATE BUNDLE DISCOUNT
         * =========================================
         */

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

            }
            else if (
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


        /*
         * =========================================
         * 8. ALLOCATE DISCOUNT
         * =========================================
         */

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
                            service.getPrice()
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


    /*
     * =========================================
     * FIND SERVICE
     * =========================================
     */

    private VendorService getService(
            String serviceId
    ) {

        return vendorServiceRepository
                .findByIdAndDeletedFalse(
                        serviceId
                )
                .orElseThrow(() ->
                        new VendorServiceNotFoundException(
                                "Service not found: "
                                        + serviceId
                        )
                );
    }


    /*
     * =========================================
     * RESOLVE PACKAGE
     * =========================================
     */

    private ServicePackage resolvePackage(
            VendorService service,
            String packageId
    ) {

        /*
         * No package selected.
         *
         * Existing service pricing behaviour
         * continues.
         */

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
                        .orElseThrow(() ->
                                new VendorServiceNotFoundException(
                                        "Selected package not found: "
                                                + packageId
                                )
                        );


        /*
         * Package must be active.
         */

        if (
                !selectedPackage.isActive()
        ) {

            throw new IllegalArgumentException(
                    "Selected package is not active."
            );
        }


        return selectedPackage;
    }


    /*
     * =========================================
     * CALCULATE BUNDLE DISCOUNT
     * =========================================
     */

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


        /*
         * PERCENTAGE
         */

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


        /*
         * FIXED
         */

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


    /*
     * =========================================
     * SAFE DECIMAL
     * =========================================
     */

    private BigDecimal safe(
            BigDecimal value
    ) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }


    /*
     * =========================================
     * INTERNAL CALCULATION LINE
     * =========================================
     */

    private record BundleCalculationLine(
            VendorService service,
            ServicePackage selectedPackage
    ) {
    }

}