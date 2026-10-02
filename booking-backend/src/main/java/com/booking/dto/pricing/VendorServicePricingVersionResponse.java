package com.booking.dto.pricing;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Builder
public class VendorServicePricingVersionResponse {

    private String id;

    private Integer version;

    private LocalDate effectiveFrom;

    private LocalDate effectiveUntil;

    private BigDecimal baseAmount;

    private Instant createdAt;

    private String createdBy;
}
