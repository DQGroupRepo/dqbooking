package com.booking.service.impl;

import com.booking.dto.pricing.DiscountSnapshot;
import com.booking.dto.pricing.PricingCalculationResult;
import com.booking.dto.pricing.PricingHeadSnapshot;
import com.booking.model.VendorDiscount;
import com.booking.model.VendorPricingHead;
import com.booking.model.VendorService;
import com.booking.model.VendorServicePricing;
import com.booking.model.embedded.ServicePackage;
import com.booking.model.enums.DiscountType;
import com.booking.model.enums.PricingCalculationType;
import com.booking.repository.VendorServicePricingRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.PricingCalculationService;
import com.booking.model.enums.AdvancePaymentType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PricingCalculationServiceImpl
        implements PricingCalculationService {

    private final VendorServicePricingRepository
            vendorServicePricingRepository;

    private final VendorServiceRepository
            vendorServiceRepository;


    @Override
    public PricingCalculationResult calculatePrice(
            String serviceId,
            LocalDate eventDate,
            ServicePackage selectedPackage
    ) {

        /*
         * =========================================
         * LOAD SERVICE
         * =========================================
         */

        VendorService service =
                vendorServiceRepository
                        .findByIdAndDeletedFalse(serviceId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Service not found."
                                )
                        );


        /*
         * =========================================
         * LOAD APPLICABLE PRICING
         * =========================================
         */

        VendorServicePricing pricing =
                vendorServicePricingRepository
                        .findByServiceIdOrderByVersionDesc(
                                serviceId
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
                                new IllegalStateException(
                                        "No applicable pricing found for service."
                                )
                        );


        /*
         * =========================================
         * BASE AMOUNT
         * =========================================
         */

        BigDecimal baseAmount;

        if (selectedPackage != null) {

            baseAmount =
                    safe(
                            selectedPackage.getPrice()
                    );

        } else {

            baseAmount =
                    safe(
                            pricing.getBaseAmount()
                    );

        }


        /*
         * =========================================
         * PRICING HEADS
         * =========================================
         */

        List<PricingHeadSnapshot> headSnapshots =

                pricing.getPricingHeads() == null

                        ? List.of()

                        : pricing.getPricingHeads()
                        .stream()

                        .filter(this::isActive)

                        .sorted(
                                Comparator.comparing(
                                        head ->
                                                safeOrder(
                                                        head.getDisplayOrder()
                                                )
                                )
                        )

                        .map(head -> {

                            BigDecimal calculatedAmount =
                                    calculateHeadAmount(
                                            baseAmount,
                                            head
                                    );

                            return PricingHeadSnapshot
                                    .builder()

                                    .code(
                                            head.getCode()
                                    )

                                    .name(
                                            head.getName()
                                    )

                                    .calculationType(
                                            head.getCalculationType()
                                    )

                                    .value(
                                            head.getValue()
                                    )

                                    .calculatedAmount(
                                            calculatedAmount
                                    )

                                    .displayOrder(
                                            head.getDisplayOrder()
                                    )

                                    .build();

                        })

                        .toList();


        /*
         * =========================================
         * SUBTOTAL
         * =========================================
         */

        BigDecimal subtotal =
                baseAmount;


        for (PricingHeadSnapshot head :
                headSnapshots) {

            subtotal =
                    subtotal.add(
                            safe(
                                    head.getCalculatedAmount()
                            )
                    );

        }


        /*
         * =========================================
         * DISCOUNTS
         * =========================================
         *
         * There are now TWO possible sources:
         *
         * 1. Normal pricing discounts
         *    configured inside VendorServicePricing
         *
         * 2. Bundle discount
         *    configured directly on VendorService
         *
         * Bundle discount belongs to THIS service only.
         *
         * Therefore:
         *
         * Catering    -> its own bundle discount
         * Decoration  -> its own bundle discount
         * Transport   -> its own bundle discount
         *
         * When multiple services are selected later,
         * each service will be calculated independently.
         */

        final BigDecimal discountBase =
                subtotal;


        List<DiscountSnapshot> discountSnapshots =
                new ArrayList<>();


        /*
         * =========================================
         * NORMAL PRICING DISCOUNTS
         * =========================================
         */

        if (pricing.getDiscounts() != null) {

            pricing.getDiscounts()
                    .stream()

                    .filter(
                            discount ->
                                    isDiscountApplicable(
                                            discount,
                                            eventDate
                                    )
                    )

                    .map(discount -> {

                        BigDecimal calculatedAmount =
                                calculateDiscount(
                                        discountBase,
                                        discount
                                );

                        return DiscountSnapshot
                                .builder()

                                .name(
                                        discount.getName()
                                )

                                .discountType(
                                        discount.getDiscountType()
                                )

                                .value(
                                        discount.getValue()
                                )

                                .calculatedAmount(
                                        calculatedAmount
                                )

                                .build();

                    })

                    .forEach(
                            discountSnapshots::add
                    );

        }


        /*
         * =========================================
         * BUNDLE DISCOUNT
         * =========================================
         *
         * Only apply when bundleEnabled = true.
         */

        if (
                Boolean.TRUE.equals(
                        service.getBundleEnabled()
                )
        ) {

            BigDecimal bundleDiscount =
                    calculateBundleDiscount(
                            discountBase,
                            service
                    );


            if (
                    bundleDiscount.compareTo(
                            BigDecimal.ZERO
                    ) > 0
            ) {

                DiscountSnapshot bundleSnapshot =
                        DiscountSnapshot
                                .builder()

                                .name(
                                        "Bundle Discount"
                                )

                                .discountType(
                                        service
                                                .getBundleDiscountType()
                                )

                                .value(
                                        service
                                                .getBundleDiscountValue()
                                )

                                .calculatedAmount(
                                        bundleDiscount
                                )

                                .build();


                discountSnapshots.add(
                        bundleSnapshot
                );

            }

        }


        /*
         * =========================================
         * TOTAL DISCOUNT
         * =========================================
         */

        BigDecimal discountAmount =
                BigDecimal.ZERO;


        for (DiscountSnapshot discount :
                discountSnapshots) {

            discountAmount =
                    discountAmount.add(
                            safe(
                                    discount.getCalculatedAmount()
                            )
                    );

        }


        /*
         * =========================================
         * DISCOUNT LIMIT
         * =========================================
         *
         * Never allow total discounts to exceed
         * the subtotal.
         */

        if (
                discountAmount.compareTo(
                        discountBase
                ) > 0
        ) {

            discountAmount =
                    discountBase;

        }


        /*
         * =========================================
         * FINAL TOTAL
         * =========================================
         */

        BigDecimal totalAmount =

                subtotal
                        .subtract(
                                discountAmount
                        )

                        .max(
                                BigDecimal.ZERO
                        )

                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );


        /*
         * =========================================
         * ADVANCE PAYMENT
         * =========================================
         */

        BigDecimal advanceAmount =
                calculateAdvance(
                        totalAmount,
                        pricing
                );


        /*
         * =========================================
         * BALANCE
         * =========================================
         */

        BigDecimal balanceAmount =

                totalAmount
                        .subtract(
                                advanceAmount
                        )

                        .max(
                                BigDecimal.ZERO
                        )

                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );


        return PricingCalculationResult
                .builder()

                .pricingId(
                        pricing.getId()
                )

                .pricingVersion(
                        pricing.getVersion()
                )

                .baseAmount(
                        baseAmount
                )

                .pricingHeads(
                        headSnapshots
                )

                .subtotal(
                        subtotal
                )

                .discounts(
                        discountSnapshots
                )

                .discountAmount(
                        discountAmount
                )

                .totalAmount(
                        totalAmount
                )

                .advanceAmount(
                        advanceAmount
                )

                .balanceAmount(
                        balanceAmount
                )

                .build();

    }


    /*
     * =========================================
     * PRICING HEAD CALCULATION
     * =========================================
     */

    private BigDecimal calculateHeadAmount(
            BigDecimal currentSubtotal,
            VendorPricingHead head
    ) {

        BigDecimal value =
                safe(
                        head.getValue()
                );


        if (
                head.getCalculationType()
                        ==
                        PricingCalculationType.FIXED
        ) {

            return value;

        }


        if (
                head.getCalculationType()
                        ==
                        PricingCalculationType.PERCENTAGE
        ) {

            return currentSubtotal

                    .multiply(value)

                    .divide(
                            BigDecimal.valueOf(100),
                            2,
                            RoundingMode.HALF_UP
                    );

        }


        return BigDecimal.ZERO;

    }


    /*
     * =========================================
     * NORMAL DISCOUNT CALCULATION
     * =========================================
     */

    private BigDecimal calculateDiscount(
            BigDecimal subtotal,
            VendorDiscount discount
    ) {

        BigDecimal value =
                safe(
                        discount.getValue()
                );


        if (
                discount.getDiscountType()
                        ==
                        DiscountType.FIXED
        ) {

            return value;

        }


        if (
                discount.getDiscountType()
                        ==
                        DiscountType.PERCENTAGE
        ) {

            return subtotal

                    .multiply(value)

                    .divide(
                            BigDecimal.valueOf(100),
                            2,
                            RoundingMode.HALF_UP
                    );

        }


        return BigDecimal.ZERO;

    }


    /*
     * =========================================
     * BUNDLE DISCOUNT CALCULATION
     * =========================================
     */

    private BigDecimal calculateBundleDiscount(
            BigDecimal subtotal,
            VendorService service
    ) {

        if (
                service.getBundleDiscountType()
                        == null
        ) {

            return BigDecimal.ZERO;

        }


        BigDecimal value =
                safe(
                        service.getBundleDiscountValue()
                );


        if (
                service.getBundleDiscountType()
                        ==
                        DiscountType.FIXED
        ) {

            return value;

        }


        if (
                service.getBundleDiscountType()
                        ==
                        DiscountType.PERCENTAGE
        ) {

            return subtotal

                    .multiply(value)

                    .divide(
                            BigDecimal.valueOf(100),
                            2,
                            RoundingMode.HALF_UP
                    );

        }


        return BigDecimal.ZERO;

    }


    /*
     * =========================================
     * ADVANCE CALCULATION
     * =========================================
     */

    private BigDecimal calculateAdvance(
            BigDecimal totalAmount,
            VendorServicePricing pricing
    ) {

        if (
                pricing.getPaymentConfiguration()
                        == null
        ) {

            return BigDecimal.ZERO;

        }


        AdvancePaymentType paymentType =

                pricing
                        .getPaymentConfiguration()
                        .getAdvancePaymentType();


        BigDecimal paymentValue =

                safe(
                        pricing
                                .getPaymentConfiguration()
                                .getAdvancePaymentValue()
                );


        if (
                paymentType == null
        ) {

            return BigDecimal.ZERO;

        }


        /*
         * =========================================
         * PERCENTAGE ADVANCE
         * =========================================
         */

        if (
                paymentType
                        ==
                        AdvancePaymentType.PERCENTAGE
        ) {

            BigDecimal advanceAmount =

                    totalAmount

                            .multiply(
                                    paymentValue
                            )

                            .divide(
                                    BigDecimal.valueOf(100),
                                    2,
                                    RoundingMode.HALF_UP
                            );


            /*
             * Never allow advance amount
             * to exceed the total amount.
             */

            return advanceAmount.min(
                    totalAmount
            );

        }


        /*
         * =========================================
         * FIXED AMOUNT ADVANCE
         * =========================================
         */

        if (
                paymentType
                        ==
                        AdvancePaymentType.FIXED_AMOUNT
        ) {

            /*
             * Never allow fixed advance
             * to exceed total amount.
             */

            return paymentValue.min(
                    totalAmount
            );

        }


        return BigDecimal.ZERO;

    }


    /*
     * =========================================
     * NORMAL DISCOUNT VALIDATION
     * =========================================
     */

    private boolean isDiscountApplicable(
            VendorDiscount discount,
            LocalDate eventDate
    ) {

        if (
                !Boolean.TRUE.equals(
                        discount.getActive()
                )
        ) {

            return false;

        }


        if (
                discount.getValidFrom() != null
                        &&
                        eventDate.isBefore(
                                discount.getValidFrom()
                        )
        ) {

            return false;

        }


        if (
                discount.getValidUntil() != null
                        &&
                        eventDate.isAfter(
                                discount.getValidUntil()
                        )
        ) {

            return false;

        }


        return true;

    }


    private boolean isActive(
            VendorPricingHead head
    ) {

        return Boolean.TRUE.equals(
                head.getActive()
        );

    }


    private BigDecimal safe(
            BigDecimal value
    ) {

        return value == null

                ? BigDecimal.ZERO

                : value;

    }


    private int safeOrder(
            Integer order
    ) {

        return order == null

                ? Integer.MAX_VALUE

                : order;

    }


    private boolean isPricingApplicable(
            VendorServicePricing pricing,
            LocalDate eventDate
    ) {

        if (
                pricing.getEffectiveFrom() != null
                        &&
                        eventDate.isBefore(
                                pricing.getEffectiveFrom()
                        )
        ) {

            return false;

        }


        if (
                pricing.getEffectiveUntil() != null
                        &&
                        eventDate.isAfter(
                                pricing.getEffectiveUntil()
                        )
        ) {

            return false;

        }


        return true;

    }

}