package com.booking.dto.bundle;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class BundleDiscountItem {

    private String serviceId;

    private String serviceName;

    private String vendorId;

    private BigDecimal originalAmount;

    private BigDecimal discountValue;

    private BigDecimal discountAmount;

    private BigDecimal finalAmount;

    private boolean bundleApplied;
}
