package com.booking.model.embedded;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import com.booking.model.enums.ServicePackageType;

@Getter
@Setter
public class BookingPricingSnapshot {

    private String pricingId;

    private Integer pricingVersion;

    private BigDecimal baseAmount =
            BigDecimal.ZERO;

    private List<BookingPricingHeadSnapshot> pricingHeads =
            new ArrayList<>();

    private BigDecimal subtotal =
            BigDecimal.ZERO;

    private List<BookingDiscountSnapshot> discounts =
            new ArrayList<>();

    private BigDecimal discountAmount =
            BigDecimal.ZERO;

    private BigDecimal totalAmount =
            BigDecimal.ZERO;

    private BigDecimal advanceAmount =
            BigDecimal.ZERO;

    private BigDecimal balanceAmount =
            BigDecimal.ZERO;

    private BigDecimal paidAmount =
            BigDecimal.ZERO;

    /*
     * =========================================
     * SELECTED SERVICE PACKAGE
     * =========================================
     *
     * Locked snapshot of the package selected
     * when the booking was created.
     */

    private String packageId;

    private ServicePackageType packageType;

    private BigDecimal packagePrice;

    private List<String> packageFeatures;
}