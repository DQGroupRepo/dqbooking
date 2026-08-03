package com.booking.dto.vendorservice;

import com.booking.dto.pricing.CancellationPolicyRequest;
import com.booking.dto.pricing.PaymentConfigurationRequest;
import com.booking.dto.pricing.VendorDiscountRequest;
import com.booking.dto.pricing.VendorPricingHeadRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ServicePricingDto {

    @NotNull(message = "Effective from date is required.")
    private LocalDate effectiveFrom;

    private LocalDate effectiveUntil;

    @NotNull(message = "Base amount is required.")
    @DecimalMin(
            value = "0.0",
            inclusive = false,
            message = "Base amount must be greater than zero."
    )
    private BigDecimal baseAmount;

    @Valid
    private List<VendorPricingHeadRequest> pricingHeads;

    @Valid
    private List<VendorDiscountRequest> discounts;

    @Valid
    private PaymentConfigurationRequest paymentConfiguration;

    @Valid
    private CancellationPolicyRequest cancellationPolicy;

}