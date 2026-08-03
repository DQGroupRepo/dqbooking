package com.booking.mapper.impl;

import com.booking.dto.pricing.*;
import com.booking.mapper.PricingMapper;
import com.booking.model.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class PricingMapperImpl implements PricingMapper {

    @Override
    public VendorServicePricing toEntity(
            CreateVendorServicePricingRequest request
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
                toCancellationPolicy(
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

        configuration.setAdvancePaymentAllowed(
                request.getAdvancePaymentAllowed()
        );

        configuration.setAdvancePercentage(
                request.getAdvancePercentage()
        );

        configuration.setPayAfterConfirmation(
                request.getPayAfterConfirmation()
        );

        configuration.setDiscussWithVendor(
                request.getDiscussWithVendor()
        );

        return configuration;
    }


    private CancellationPolicy toCancellationPolicy(
            CancellationPolicyRequest request
    ) {

        if (request == null) {

            return null;

        }

        CancellationPolicy policy =
                new CancellationPolicy();

        policy.setCancellationAllowed(
                request.getCancellationAllowed()
        );

        policy.setActive(
                request.getActive()
        );

        if (request.getRules() != null) {

            policy.setRules(

                    request.getRules()
                            .stream()
                            .map(ruleRequest -> {

                                CancellationRule rule =
                                        new CancellationRule();

                                rule.setMinimumDaysBeforeEvent(
                                        ruleRequest
                                                .getMinimumDaysBeforeEvent()
                                );

                                rule.setChargeType(
                                        ruleRequest
                                                .getChargeType()
                                );

                                rule.setChargeValue(
                                        ruleRequest
                                                .getChargeValue()
                                );

                                return rule;

                            })
                            .toList()
            );

        }

        return policy;
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

                .build();
    }
}