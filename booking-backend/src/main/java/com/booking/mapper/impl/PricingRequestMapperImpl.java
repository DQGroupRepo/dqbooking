package com.booking.mapper.impl;

import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.vendorservice.ServicePricingDto;
import com.booking.mapper.PricingRequestMapper;
import org.springframework.stereotype.Component;

@Component
public class PricingRequestMapperImpl
        implements PricingRequestMapper {

    @Override
    public VendorServicePricingRequest toPricingRequest(
            ServicePricingDto dto
    ) {

        if (dto == null) {
            return null;
        }

        VendorServicePricingRequest request =
                new VendorServicePricingRequest();

        request.setEffectiveFrom(dto.getEffectiveFrom());
        request.setEffectiveUntil(dto.getEffectiveUntil());

        request.setBaseAmount(dto.getBaseAmount());

        request.setPricingHeads(dto.getPricingHeads());

        request.setDiscounts(dto.getDiscounts());

        request.setPaymentConfiguration(
                dto.getPaymentConfiguration()
        );

        return request;
    }

}