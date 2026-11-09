package com.booking.dto.customer;

import com.booking.model.embedded.ServicePackage;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class VendorPricingForDateResponse {

    private String pricingId;

    private Integer version;

    private LocalDate effectiveFrom;

    private LocalDate effectiveUntil;

    private BigDecimal baseAmount;

    private LocalDate eventDate;

    private List<ServicePackage> packages;
}
