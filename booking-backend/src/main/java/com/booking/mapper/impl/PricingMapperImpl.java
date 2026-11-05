package com.booking.mapper.impl;

import com.booking.dto.pricing.*;
import com.booking.dto.service.ServicePackageRequest;
import com.booking.dto.service.ServicePackageResponse;
import com.booking.mapper.CancellationPolicyMapper;
import com.booking.mapper.PricingMapper;
import com.booking.model.*;
import com.booking.model.embedded.ServicePackage;
import org.springframework.stereotype.Component;
import org.bson.types.ObjectId;

import com.booking.dto.service.CateringPackageDishRequest;
import com.booking.dto.service.CateringPackageDishResponse;
import com.booking.dto.service.CateringPackageMenuRequest;
import com.booking.dto.service.CateringPackageMenuResponse;
import com.booking.model.embedded.CateringPackageDish;
import com.booking.model.embedded.CateringPackageMenu;

import java.util.Collections;

@Component
public class PricingMapperImpl implements PricingMapper {

    private final CancellationPolicyMapper cancellationPolicyMapper;

    public PricingMapperImpl(
            CancellationPolicyMapper cancellationPolicyMapper
    ) {
        this.cancellationPolicyMapper =
                cancellationPolicyMapper;
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
                request.getPricingHeads() == null
                        ? Collections.emptyList()
                        : request.getPricingHeads()
                        .stream()
                        .map(this::toPricingHead)
                        .toList()
        );

        pricing.setDiscounts(
                request.getDiscounts() == null
                        ? Collections.emptyList()
                        : request.getDiscounts()
                        .stream()
                        .map(this::toDiscount)
                        .toList()
        );

        /*
         * =========================================
         * SERVICE PACKAGES
         * =========================================
         *
         * Packages now belong directly to the
         * VendorServicePricing document.
         */

        pricing.setPackages(
                request.getPackages() == null
                        ? Collections.emptyList()
                        : request.getPackages()
                        .stream()
                        .map(this::toServicePackage)
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

    private ServicePackage toServicePackage(
            ServicePackageRequest request
    ) {

        ServicePackage servicePackage =
                new ServicePackage();

        // Package IDs are required by the booking/hold API.
        // Preserve an existing ID; assign one only for a new package.
        String packageId = request.getId();
        if (packageId == null || packageId.isBlank()) {
            packageId = new ObjectId().toHexString();
        }
        servicePackage.setId(packageId);

        servicePackage.setName(
                request.getName()
        );

        servicePackage.setPrice(
                request.getPrice()
        );

        servicePackage.setFeatures(
                request.getFeatures()
        );

        servicePackage.setActive(
                request.isActive()
        );
        servicePackage.setCapacity(request.getCapacity());
        servicePackage.setPackageType(request.getPackageType());
        servicePackage.setRequiresSlot(request.isRequiresSlot());
        servicePackage.setSlotIds(request.getSlotIds() == null
                ? new java.util.ArrayList<>() : new java.util.ArrayList<>(request.getSlotIds()));
        servicePackage.setMaxGuestsPerRoom(request.getMaxGuestsPerRoom());

        servicePackage.setCateringMenu(
                toCateringPackageMenu(
                        request.getCateringPackageMenu()
                )
        );

        return servicePackage;
    }

    private CateringPackageMenu toCateringPackageMenu(
            CateringPackageMenuRequest request
    ) {

        if (request == null) {
            return null;
        }

        CateringPackageMenu menu =
                new CateringPackageMenu();

        menu.setVegetarianSelectionLimit(
                request.getVegetarianSelectionLimit()
        );

        menu.setNonVegetarianSelectionLimit(
                request.getNonVegetarianSelectionLimit()
        );

        menu.setVegetarianDishes(
                request.getVegetarianDishes() == null
                        ? new java.util.ArrayList<>()
                        : request.getVegetarianDishes()
                        .stream()
                        .map(this::toCateringPackageDish)
                        .toList()
        );

        menu.setNonVegetarianDishes(
                request.getNonVegetarianDishes() == null
                        ? new java.util.ArrayList<>()
                        : request.getNonVegetarianDishes()
                        .stream()
                        .map(this::toCateringPackageDish)
                        .toList()
        );

        return menu;
    }

    private CateringPackageDish toCateringPackageDish(
            CateringPackageDishRequest request
    ) {

        CateringPackageDish dish =
                new CateringPackageDish();

        dish.setMenuItemId(
                request.getMenuItemId()
        );

        dish.setDishId(
                request.getDishId()
        );

        dish.setName(
                request.getName()
        );

        return dish;
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

                /*
                 * =========================================
                 * PACKAGES
                 * =========================================
                 *
                 * Packages are now read directly from
                 * VendorServicePricing.
                 */

                .packages(
                        pricing.getPackages() == null
                                ? Collections.emptyList()
                                : pricing.getPackages()
                                .stream()
                                .map(this::toServicePackageResponse)
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

    private ServicePackageResponse toServicePackageResponse(
            ServicePackage servicePackage
    ) {

        ServicePackageResponse response =
                new ServicePackageResponse();

        response.setId(
                servicePackage.getId()
        );

        response.setName(
                servicePackage.getName()
        );

        response.setPrice(
                servicePackage.getPrice()
        );

        response.setFeatures(
                servicePackage.getFeatures()
        );

        response.setActive(
                servicePackage.isActive()
        );
        response.setCapacity(servicePackage.getCapacity());
        response.setPackageType(servicePackage.getPackageType());
        response.setRequiresSlot(servicePackage.getRequiresSlot());
        response.setSlotIds(servicePackage.getSlotIds() == null
                ? java.util.Collections.emptyList() : servicePackage.getSlotIds());
        response.setMaxGuestsPerRoom(servicePackage.getMaxGuestsPerRoom());

        response.setCateringMenu(
                toCateringPackageMenuResponse(
                        servicePackage.getCateringMenu()
                )
        );

        return response;
    }

    private CateringPackageMenuResponse
    toCateringPackageMenuResponse(
            CateringPackageMenu menu
    ) {

        if (menu == null) {
            return null;
        }

        CateringPackageMenuResponse response =
                new CateringPackageMenuResponse();

        response.setVegetarianSelectionLimit(
                menu.getVegetarianSelectionLimit()
        );

        response.setNonVegetarianSelectionLimit(
                menu.getNonVegetarianSelectionLimit()
        );

        response.setVegetarianDishes(
                menu.getVegetarianDishes() == null
                        ? Collections.emptyList()
                        : menu.getVegetarianDishes()
                        .stream()
                        .map(this::toCateringPackageDishResponse)
                        .toList()
        );

        response.setNonVegetarianDishes(
                menu.getNonVegetarianDishes() == null
                        ? Collections.emptyList()
                        : menu.getNonVegetarianDishes()
                        .stream()
                        .map(this::toCateringPackageDishResponse)
                        .toList()
        );

        return response;
    }

    private CateringPackageDishResponse
    toCateringPackageDishResponse(
            CateringPackageDish dish
    ) {

        CateringPackageDishResponse response =
                new CateringPackageDishResponse();

        response.setMenuItemId(
                dish.getMenuItemId()
        );

        response.setDishId(
                dish.getDishId()
        );

        response.setName(
                dish.getName()
        );

        return response;
    }

    private PaymentConfigurationResponse
    toPaymentConfigurationResponse(
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

        /*
         * The service parameter is retained because it is part
         * of the existing PricingMapper interface/callers.
         *
         * Packages no longer come from VendorService.
         * They are mapped from the pricing document itself.
         */

        return toResponse(pricing);
    }
}