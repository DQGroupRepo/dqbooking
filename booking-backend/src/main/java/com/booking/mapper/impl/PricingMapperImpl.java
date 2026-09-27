package com.booking.mapper.impl;

import com.booking.dto.pricing.*;
import com.booking.mapper.PricingMapper;
import com.booking.mapper.CancellationPolicyMapper;
import com.booking.model.*;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class PricingMapperImpl implements PricingMapper {

    private final CancellationPolicyMapper cancellationPolicyMapper;

    public PricingMapperImpl(
            CancellationPolicyMapper cancellationPolicyMapper
    ) {
        this.cancellationPolicyMapper = cancellationPolicyMapper;
    }

    @Override
    public VendorServicePricing toEntity(
            VendorServicePricingRequest request
    ) {

        VendorServicePricing pricing =
                new VendorServicePricing();

        pricing.setServiceId(
                request.getServiceId()
        );

        pricing.setEffectiveFrom(
                request.getEffectiveFrom()
        );

        pricing.setEffectiveUntil(
                request.getEffectiveUntil()
        );

        pricing.setBaseAmount(
                request.getBaseAmount()
        );

        pricing.setPricingHeads(
                request.getPricingHeads()
                        .stream()
                        .map(this::toPricingHead)
                        .toList()
        );

        pricing.setDiscounts(
                request.getDiscounts()
                        .stream()
                        .map(this::toDiscount)
                        .toList()
        );

        pricing.setPaymentConfiguration(
                toPaymentConfiguration(
                        request.getPaymentConfiguration()
                )
        );
        pricing.setCancellationPolicy(
                cancellationPolicyMapper.toEntity(
                        request.getCancellationPolicy()
                )
        );

        return pricing;
    }


    private VendorPricingHead toPricingHead(
            VendorPricingHeadRequest request
    ) {

        VendorPricingHead head =
                new VendorPricingHead();

        head.setCode(
                request.getCode()
        );

        head.setName(
                request.getName()
        );

        head.setCalculationType(
                request.getCalculationType()
        );

        head.setValue(
                request.getValue()
        );

        head.setDisplayOrder(
                request.getDisplayOrder()
        );

        head.setActive(
                request.getActive()
        );

        return head;
    }


    private VendorDiscount toDiscount(
            VendorDiscountRequest request
    ) {

        VendorDiscount discount =
                new VendorDiscount();

        discount.setName(
                request.getName()
        );

        discount.setDiscountType(
                request.getDiscountType()
        );

        discount.setValue(
                request.getValue()
        );

        discount.setValidFrom(
                request.getValidFrom()
        );

        discount.setValidUntil(
                request.getValidUntil()
        );

        discount.setActive(
                request.getActive()
        );

        return discount;
    }


    private PaymentConfiguration toPaymentConfiguration(
            PaymentConfigurationRequest request
    ) {

        if (request == null) {

            return null;

        }

        PaymentConfiguration configuration =
                new PaymentConfiguration();

        configuration.setAdvancePaymentType(
                request.getAdvancePaymentType()
        );

        configuration.setAdvancePaymentValue(
                request.getAdvancePaymentValue()
        );

        configuration.setPayAfterConfirmation(
                request.getPayAfterConfirmation()
        );

        configuration.setDiscussWithVendor(
                request.getDiscussWithVendor()
        );

        return configuration;
    }

    @Override
    public VendorServicePricingResponse toResponse(
            VendorServicePricing pricing
    ) {

        return VendorServicePricingResponse
                .builder()

                .id(pricing.getId())

                .vendorId(pricing.getVendorId())

                .serviceId(pricing.getServiceId())

                .version(pricing.getVersion())

                .effectiveFrom(
                        pricing.getEffectiveFrom()
                )

                .effectiveUntil(
                        pricing.getEffectiveUntil()
                )

                .baseAmount(
                        pricing.getBaseAmount()
                )

                .pricingHeads(
                        pricing.getPricingHeads() == null
                                ? Collections.emptyList()
                                : pricing.getPricingHeads()
                                .stream()
                                .map(head ->

                                        VendorPricingHeadResponse
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

                                                .displayOrder(
                                                        head.getDisplayOrder()
                                                )

                                                .active(
                                                        head.getActive()
                                                )

                                                .build()

                                )
                                .toList()
                )

                .discounts(
                        pricing.getDiscounts() == null
                                ? Collections.emptyList()
                                : pricing.getDiscounts()
                                .stream()
                                .map(discount ->

                                        VendorDiscountResponse
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

                                                .validFrom(
                                                        discount.getValidFrom()
                                                )

                                                .validUntil(
                                                        discount.getValidUntil()
                                                )

                                                .active(
                                                        discount.getActive()
                                                )

                                                .build()

                                )
                                .toList()
                )

                .paymentConfiguration(
                        toPaymentConfigurationResponse(
                                pricing.getPaymentConfiguration()
                        )
                )
                .cancellationPolicy(
                        cancellationPolicyMapper.toResponse(
                                pricing.getCancellationPolicy()
                        )
                )

                .build();
    }

    private PaymentConfigurationResponse toPaymentConfigurationResponse(
            PaymentConfiguration configuration
    ) {

        if (configuration == null) {

            return null;

        }

        return PaymentConfigurationResponse
                .builder()

                .advancePaymentType(
                        configuration.getAdvancePaymentType()
                )

                .advancePaymentValue(
                        configuration.getAdvancePaymentValue()
                )

                .payAfterConfirmation(
                        configuration.getPayAfterConfirmation()
                )

                .discussWithVendor(
                        configuration.getDiscussWithVendor()
                )

                .build();

    }

    @Override
    public VendorServicePricingResponse toResponse(
            VendorServicePricing pricing,
            VendorService service
    ) {

        return VendorServicePricingResponse
                .builder()

                .id(pricing.getId())

                .vendorId(pricing.getVendorId())

                .serviceId(pricing.getServiceId())

                .version(pricing.getVersion())

                .effectiveFrom(
                        pricing.getEffectiveFrom()
                )

                .effectiveUntil(
                        pricing.getEffectiveUntil()
                )

                .baseAmount(
                        pricing.getBaseAmount()
                )

                .pricingHeads(
                        pricing.getPricingHeads() == null
                                ? Collections.emptyList()
                                : pricing.getPricingHeads()
                                .stream()
                                .map(head ->

                                        VendorPricingHeadResponse
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

                                                .displayOrder(
                                                        head.getDisplayOrder()
                                                )

                                                .active(
                                                        head.getActive()
                                                )

                                                .build()

                                )
                                .toList()
                )

                .discounts(
                        pricing.getDiscounts() == null
                                ? Collections.emptyList()
                                : pricing.getDiscounts()
                                .stream()
                                .map(discount ->

                                        VendorDiscountResponse
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

                                                .validFrom(
                                                        discount.getValidFrom()
                                                )

                                                .validUntil(
                                                        discount.getValidUntil()
                                                )

                                                .active(
                                                        discount.getActive()
                                                )

                                                .build()

                                )
                                .toList()
                )

                .paymentConfiguration(
                        toPaymentConfigurationResponse(
                                pricing.getPaymentConfiguration()
                        )
                )

                .cancellationPolicy(
                        cancellationPolicyMapper.toResponse(
                                pricing.getCancellationPolicy()
                        )
                )

                /*
                 * Packages come from VendorService.
                 */
                .packages(
                        service.getPackages() == null

                                ? Collections.emptyList()

                                : service.getPackages()
                                .stream()
                                .map(servicePackage ->

                                        ServicePackageResponse
                                                .builder()

                                                .id(
                                                        servicePackage.getId()
                                                )

                                                .name(
                                                        servicePackage.getName()
                                                )

                                                .price(
                                                        servicePackage.getPrice()
                                                )

                                                .features(
                                                        servicePackage.getFeatures()
                                                )

                                                .active(
                                                        servicePackage.isActive()
                                                )

                                                .build()

                                )
                                .toList()
                )

                .build();

    }
}