package com.booking.service.impl;

import com.booking.dto.bundle.BundleCalculationRequest;
import com.booking.dto.bundle.BundleCalculationResponse;
import com.booking.dto.bundle.BundleDiscountItem;
import com.booking.exception.VendorServiceNotFoundException;
import com.booking.model.VendorService;
import com.booking.model.enums.DiscountType;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.BundleCalculationService;
import lombok.RequiredArgsConstructor;
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

    private final VendorServiceRepository vendorServiceRepository;


    @Override
    public BundleCalculationResponse calculateBundle(
            BundleCalculationRequest request) {

        List<VendorService> services =
                request.getServiceIds()
                        .stream()
                        .distinct()
                        .map(this::getService)
                        .toList();


        if (services.isEmpty()) {

            return BundleCalculationResponse.builder()
                    .bundleApplied(false)
                    .qualifyingServiceCount(0)
                    .originalTotal(BigDecimal.ZERO)
                    .totalDiscount(BigDecimal.ZERO)
                    .finalTotal(BigDecimal.ZERO)
                    .items(List.of())
                    .build();
        }


        /*
         * Group selected services by vendor.
         *
         * Bundle qualification is vendor-specific.
         */
        Map<String, List<VendorService>> servicesByVendor =
                services.stream()
                        .collect(
                                Collectors.groupingBy(
                                        VendorService::getVendorId
                                )
                        );


        /*
         * A bundle is currently calculated per vendor.
         *
         * If the cart contains services from multiple vendors,
         * each vendor's group is evaluated independently.
         *
         * This means:
         *
         * Vendor A -> 2 qualifying services -> discount
         * Vendor B -> 1 qualifying service -> no discount
         */
        List<BundleDiscountItem> resultItems =
                new ArrayList<>();


        BigDecimal originalTotal =
                BigDecimal.ZERO;

        BigDecimal finalTotal =
                BigDecimal.ZERO;

        BigDecimal totalDiscount =
                BigDecimal.ZERO;


        for (Map.Entry<String, List<VendorService>> entry :
                servicesByVendor.entrySet()) {

            List<VendorService> vendorServices =
                    entry.getValue();


            /*
             * Only bundle-enabled services qualify.
             */
            List<VendorService> bundleServices =
                    vendorServices.stream()
                            .filter(service ->
                                    Boolean.TRUE.equals(
                                            service.getBundleEnabled()
                                    )
                            )
                            .toList();


            boolean bundleApplied =
                    bundleServices.size() >= 2;


            for (VendorService service :
                    vendorServices) {

                BigDecimal originalAmount =
                        service.getPrice() != null
                                ? service.getPrice()
                                : BigDecimal.ZERO;


                BigDecimal discountAmount =
                        BigDecimal.ZERO;


                /*
                 * Discount is applied only when:
                 *
                 * 1. At least two bundle services
                 *    from this vendor are selected.
                 *
                 * 2. This particular service has
                 *    bundleEnabled = true.
                 */
                if (bundleApplied &&
                        Boolean.TRUE.equals(
                                service.getBundleEnabled()
                        )) {

                    discountAmount =
                            calculateDiscount(
                                    service
                            );
                }


                BigDecimal finalAmount =
                        originalAmount
                                .subtract(
                                        discountAmount
                                )
                                .max(
                                        BigDecimal.ZERO
                                );


                originalTotal =
                        originalTotal.add(
                                originalAmount
                        );

                totalDiscount =
                        totalDiscount.add(
                                discountAmount
                        );

                finalTotal =
                        finalTotal.add(
                                finalAmount
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
                                        service.getBundleDiscountValue()
                                )
                                .discountAmount(
                                        discountAmount
                                )
                                .finalAmount(
                                        finalAmount
                                )
                                .bundleApplied(
                                        discountAmount.compareTo(
                                                BigDecimal.ZERO
                                        ) > 0
                                )
                                .build()
                );
            }
        }


        /*
         * Bundle is applied if at least one
         * vendor group qualified.
         */
        boolean bundleApplied =
                totalDiscount.compareTo(
                        BigDecimal.ZERO
                ) > 0;


        String qualifyingVendorId =
                servicesByVendor.entrySet()
                        .stream()
                        .filter(entry ->
                                entry.getValue()
                                        .stream()
                                        .filter(service ->
                                                Boolean.TRUE.equals(
                                                        service.getBundleEnabled()
                                                )
                                        )
                                        .count() >= 2
                        )
                        .map(Map.Entry::getKey)
                        .findFirst()
                        .orElse(null);


        int qualifyingServiceCount =
                qualifyingVendorId == null
                        ? 0
                        : servicesByVendor
                        .get(qualifyingVendorId)
                        .stream()
                        .filter(service ->
                                Boolean.TRUE.equals(
                                        service.getBundleEnabled()
                                )
                        )
                        .toList()
                        .size();


        return BundleCalculationResponse.builder()
                .bundleApplied(bundleApplied)
                .vendorId(qualifyingVendorId)
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
                .items(resultItems)
                .build();
    }


    private VendorService getService(
            String serviceId) {

        return vendorServiceRepository
                .findByIdAndDeletedFalse(serviceId)
                .orElseThrow(() ->
                        new VendorServiceNotFoundException(
                                "Service not found: "
                                        + serviceId
                        )
                );
    }


    private BigDecimal calculateDiscount(
            VendorService service) {

        if (service.getBundleDiscountValue() == null ||
                service.getBundleDiscountType() == null ||
                service.getPrice() == null) {

            return BigDecimal.ZERO;
        }


        BigDecimal value =
                service.getBundleDiscountValue();


        if (value.compareTo(BigDecimal.ZERO) <= 0) {

            return BigDecimal.ZERO;
        }


        if (service.getBundleDiscountType()
                == DiscountType.PERCENTAGE) {

            return service.getPrice()
                    .multiply(value)
                    .divide(
                            BigDecimal.valueOf(100),
                            2,
                            RoundingMode.HALF_UP
                    );
        }


        if (service.getBundleDiscountType()
                == DiscountType.FIXED) {

            return value.min(
                    service.getPrice()
            );
        }


        return BigDecimal.ZERO;
    }
}