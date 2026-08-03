package com.booking.dto.pricing;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class VendorServicePricingResponse {

    private String id;

    private String vendorId;

    private String serviceId;

    private Integer version;

    private LocalDate effectiveFrom;

    private LocalDate effectiveUntil;

    private BigDecimal baseAmount;

    private List<VendorPricingHeadResponse> pricingHeads;

    private List<VendorDiscountResponse> discounts;

    private PaymentConfigurationResponse paymentConfiguration;

    private CancellationPolicyResponse cancellationPolicy;
}