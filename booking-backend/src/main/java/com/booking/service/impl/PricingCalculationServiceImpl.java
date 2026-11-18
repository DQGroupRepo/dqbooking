package com.booking.service.impl;

import com.booking.dto.pricing.DiscountSnapshot;
import com.booking.dto.pricing.PricingCalculationResult;
import com.booking.dto.pricing.PricingHeadSnapshot;
import com.booking.model.VendorDiscount;
import com.booking.model.VendorPricingHead;
import com.booking.model.VendorService;
import com.booking.model.VendorServicePricing;
import com.booking.model.embedded.ServicePackage;
import com.booking.model.enums.AdvancePaymentType;
import com.booking.model.enums.DiscountType;
import com.booking.model.enums.PricingCalculationType;
import com.booking.repository.VendorServicePricingRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.PricingCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
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
            String packageId
    ) {
        return calculatePrice(serviceId, eventDate, packageId, null);
    }

    @Override
    public PricingCalculationResult calculatePrice(
            String serviceId,
            LocalDate eventDate,
            String packageId,
            Integer guestCount
    ) {

        log.info(
                "Calculating service price serviceId={} eventDate={} packageId={}",
                serviceId,
                eventDate,
                packageId
        );

        VendorService service =
                vendorServiceRepository
                        .findByIdAndDeletedFalse(serviceId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Service not found."
                                )
                        );

        VendorServicePricing pricing =
                vendorServicePricingRepository
                        .findByServiceIdOrderByVersionDesc(serviceId)
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

        ServicePackage selectedPackage =
                resolvePackage(
                        pricing,
                        packageId
                );

        BigDecimal baseAmount =
                selectedPackage != null
                        ? safe(selectedPackage.getPrice())
                        : safe(pricing.getBaseAmount());
        int cateringGuests = service.getCategory() == com.booking.model.enums.ServiceCategory.CATERING
                ? Math.max(1, guestCount == null ? 1 : guestCount) : 1;
        if (service.getCategory() == com.booking.model.enums.ServiceCategory.CATERING) {
            baseAmount = baseAmount.multiply(BigDecimal.valueOf(cateringGuests));
        }

        final BigDecimal headCalculationBaseAmount = baseAmount;
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
                                            headCalculationBaseAmount,
                                            head,
                                            cateringGuests
                                    );

                            return PricingHeadSnapshot
                                    .builder()
                                    .code(head.getCode())
                                    .name(head.getName())
                                    .calculationType(
                                            head.getCalculationType()
                                    )
                                    .value(head.getValue())
                                    .calculatedAmount(
                                            calculatedAmount
                                    )
                                    .displayOrder(
                                            head.getDisplayOrder()
                                    )
                                    .build();
                        })
                        .toList();

        BigDecimal subtotal = baseAmount;

        for (PricingHeadSnapshot head : headSnapshots) {
            subtotal =
                    subtotal.add(
                            safe(head.getCalculatedAmount())
                    );
        }

        final BigDecimal discountBase = subtotal;

        List<DiscountSnapshot> discountSnapshots =
                new ArrayList<>();

        if (pricing.getDiscounts() != null) {

            pricing.getDiscounts()
                    .stream()
                    .filter(discount ->
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
                                .name(discount.getName())
                                .discountType(
                                        discount.getDiscountType()
                                )
                                .value(discount.getValue())
                                .calculatedAmount(
                                        calculatedAmount
                                )
                                .build();
                    })
                    .forEach(discountSnapshots::add);
        }

        if (Boolean.TRUE.equals(
                service.getBundleEnabled()
        )) {

            BigDecimal bundleDiscount =
                    calculateBundleDiscount(
                            discountBase,
                            service
                    );

            if (bundleDiscount.compareTo(
                    BigDecimal.ZERO
            ) > 0) {

                discountSnapshots.add(
                        DiscountSnapshot.builder()
                                .name("Bundle Discount")
                                .discountType(
                                        service.getBundleDiscountType()
                                )
                                .value(
                                        service.getBundleDiscountValue()
                                )
                                .calculatedAmount(
                                        bundleDiscount
                                )
                                .build()
                );
            }
        }

        BigDecimal discountAmount =
                discountSnapshots
                        .stream()
                        .map(DiscountSnapshot::getCalculatedAmount)
                        .map(this::safe)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        if (discountAmount.compareTo(
                discountBase
        ) > 0) {
            discountAmount = discountBase;
        }

        BigDecimal totalAmount =
                subtotal
                        .subtract(discountAmount)
                        .max(BigDecimal.ZERO)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        BigDecimal advanceAmount =
                calculateAdvance(
                        totalAmount,
                        pricing
                );

        BigDecimal balanceAmount =
                totalAmount
                        .subtract(advanceAmount)
                        .max(BigDecimal.ZERO)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        log.info(
                "Price calculated serviceId={} pricingId={} pricingVersion={} subtotal={} discountAmount={} totalAmount={} advanceAmount={} balanceAmount={}",
                serviceId,
                pricing.getId(),
                pricing.getVersion(),
                subtotal,
                discountAmount,
                totalAmount,
                advanceAmount,
                balanceAmount
        );

        return PricingCalculationResult
                .builder()
                .pricingId(pricing.getId())
                .pricingVersion(pricing.getVersion())
                .baseAmount(baseAmount)
                .pricingHeads(headSnapshots)
                .subtotal(subtotal)
                .discounts(discountSnapshots)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .advanceAmount(advanceAmount)
                .balanceAmount(balanceAmount)
                .build();
    }

    private ServicePackage resolvePackage(
            VendorServicePricing pricing,
            String packageId
    ) {

        if (packageId == null || packageId.isBlank()) {
            return null;
        }

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
                                new IllegalArgumentException(
                                        "Selected package not found: "
                                                + packageId
                                ));

        if (!selectedPackage.isActive()) {
            throw new IllegalArgumentException(
                    "Selected package is not active."
            );
        }

        return selectedPackage;
    }

    private BigDecimal calculateHeadAmount(
            BigDecimal currentSubtotal,
            VendorPricingHead head,
            int guestCount
    ) {

        BigDecimal value = safe(head.getValue());

        if (head.getCalculationType()
                == PricingCalculationType.FIXED) {
            return value;
        }

        if (head.getCalculationType()
                == PricingCalculationType.PER_GUEST) {
            return value.multiply(BigDecimal.valueOf(Math.max(1, guestCount)));
        }

        if (head.getCalculationType()
                == PricingCalculationType.PERCENTAGE) {

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

    private BigDecimal calculateDiscount(
            BigDecimal subtotal,
            VendorDiscount discount
    ) {

        BigDecimal value = safe(discount.getValue());

        if (discount.getDiscountType()
                == DiscountType.FIXED) {
            return value;
        }

        if (discount.getDiscountType()
                == DiscountType.PERCENTAGE) {

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

    private BigDecimal calculateBundleDiscount(
            BigDecimal subtotal,
            VendorService service
    ) {

        if (service.getBundleDiscountType() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal value =
                safe(service.getBundleDiscountValue());

        if (service.getBundleDiscountType()
                == DiscountType.FIXED) {
            return value;
        }

        if (service.getBundleDiscountType()
                == DiscountType.PERCENTAGE) {

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

    private BigDecimal calculateAdvance(
            BigDecimal totalAmount,
            VendorServicePricing pricing
    ) {

        if (pricing.getPaymentConfiguration() == null) {
            return BigDecimal.ZERO;
        }

        AdvancePaymentType paymentType =
                pricing.getPaymentConfiguration()
                        .getAdvancePaymentType();

        BigDecimal paymentValue =
                safe(
                        pricing.getPaymentConfiguration()
                                .getAdvancePaymentValue()
                );

        if (paymentType == null) {
            return BigDecimal.ZERO;
        }

        if (paymentType
                == AdvancePaymentType.PERCENTAGE) {

            return totalAmount
                    .multiply(paymentValue)
                    .divide(
                            BigDecimal.valueOf(100),
                            2,
                            RoundingMode.HALF_UP
                    )
                    .min(totalAmount);
        }

        if (paymentType
                == AdvancePaymentType.FIXED_AMOUNT) {

            return paymentValue.min(totalAmount);
        }

        return BigDecimal.ZERO;
    }

    private boolean isDiscountApplicable(
            VendorDiscount discount,
            LocalDate eventDate
    ) {

        if (!Boolean.TRUE.equals(
                discount.getActive()
        )) {
            return false;
        }

        if (discount.getValidFrom() != null
                && eventDate.isBefore(
                discount.getValidFrom()
        )) {
            return false;
        }

        if (discount.getValidUntil() != null
                && eventDate.isAfter(
                discount.getValidUntil()
        )) {
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
}
