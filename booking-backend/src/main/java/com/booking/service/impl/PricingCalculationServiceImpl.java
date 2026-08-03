package com.booking.service.impl;

import com.booking.dto.pricing.DiscountSnapshot;
import com.booking.dto.pricing.PricingCalculationResult;
import com.booking.dto.pricing.PricingHeadSnapshot;
import com.booking.model.VendorDiscount;
import com.booking.model.VendorPricingHead;
import com.booking.model.VendorServicePricing;
import com.booking.model.enums.DiscountType;
import com.booking.model.enums.PricingCalculationType;
import com.booking.repository.VendorServicePricingRepository;
import com.booking.service.PricingCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PricingCalculationServiceImpl
        implements PricingCalculationService {

    private final VendorServicePricingRepository
            vendorServicePricingRepository;


    @Override
    public PricingCalculationResult calculatePrice(
            String serviceId,
            LocalDate eventDate
    ) {

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

        BigDecimal baseAmount =
                safe(pricing.getBaseAmount());


        /*
         * =========================================
         * PRICING HEADS
         * =========================================
         */

        /*
         * =========================================
         * PRICING HEADS
         * =========================================
         *
         * Each pricing head is currently calculated
         * against the base amount.
         *
         * Example:
         *
         * Base Amount = 1000
         * Decoration  = 10% of Base = 100
         * Service Fee = 5% of Base = 50
         *
         * Subtotal = 1150
         *
         * This prevents the Java lambda from capturing
         * a variable that is later modified.
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
         */

        /*
         * =========================================
         * DISCOUNTS
         * =========================================
         *
         * Discounts are calculated against the completed
         * subtotal after all active pricing heads.
         *
         * subtotal is no longer modified after this point,
         * so it can safely be used inside the lambda.
         */

        final BigDecimal discountBase = subtotal;

        List<DiscountSnapshot> discountSnapshots =

                pricing.getDiscounts() == null

                        ? List.of()

                        : pricing.getDiscounts()
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

                        .toList();


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
         * Never allow total discount to exceed
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
     * DISCOUNT CALCULATION
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


        if (
                !Boolean.TRUE.equals(
                        pricing
                                .getPaymentConfiguration()
                                .getAdvancePaymentAllowed()
                )
        ) {

            return BigDecimal.ZERO;

        }


        BigDecimal percentage =

                safe(
                        pricing
                                .getPaymentConfiguration()
                                .getAdvancePercentage()
                );


        return totalAmount

                .multiply(
                        percentage
                )

                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP
                );

    }


    /*
     * =========================================
     * DISCOUNT VALIDATION
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