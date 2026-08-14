package com.booking.dto.bundle;

import com.booking.dto.bundle.BundleDiscountItem;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class BundleCalculationResponse {

    private boolean bundleApplied;

    private String vendorId;

    private int qualifyingServiceCount;

    private BigDecimal totalDiscount;

    private BigDecimal originalTotal;

    private BigDecimal finalTotal;

    private List<BundleDiscountItem> items;
}
