package com.booking.mapper.impl;

import com.booking.dto.pricing.CreateVendorServicePricingRequest;
import com.booking.dto.vendorservice.ServicePricingDto;
import com.booking.mapper.PricingRequestMapper;
import org.springframework.stereotype.Component;

@Component
public class PricingRequestMapperImpl
        implements PricingRequestMapper {

    @Override
    public CreateVendorServicePricingRequest toPricingRequest(
            ServicePricingDto dto
    ) {

        if (dto == null) {
            return null;
        }

        CreateVendorServicePricingRequest request =
                new CreateVendorServicePricingRequest();

        request.setEffectiveFrom(dto.getEffectiveFrom());
        request.setEffectiveUntil(dto.getEffectiveUntil());

        request.setBaseAmount(dto.getBaseAmount());

        request.setPricingHeads(dto.getPricingHeads());

        request.setDiscounts(dto.getDiscounts());

        request.setPaymentConfiguration(
                dto.getPaymentConfiguration()
        );

        request.setCancellationPolicy(
                dto.getCancellationPolicy()
        );

        return request;
    }

}