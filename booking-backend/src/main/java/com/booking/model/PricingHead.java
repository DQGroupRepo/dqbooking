package com.booking.model;

import com.booking.model.enums.PricingBaseType;
import com.booking.model.enums.PricingCalculationType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PricingHead {

    /*
     * Unique identifier inside this pricing version.
     */
    private String id;

    /*
     * Example:
     * Decoration
     * Catering
     * Cleaning Fee
     * Service Charge
     * GST
     */
    private String name;

    /*
     * FIXED
     * PERCENTAGE
     */
    private PricingCalculationType calculationType;

    /*
     * Example:
     *
     * FIXED:
     * 10000
     *
     * PERCENTAGE:
     * 5
     */
    private BigDecimal rate;

    /*
     * Determines what the percentage
     * is calculated against.
     *
     * BASE_PRICE
     * SUBTOTAL
     * AFTER_DISCOUNT
     */
    private PricingBaseType pricingBaseType;

    /*
     * Controls whether this charge
     * is taxable or not.
     */
    private Boolean taxable = false;

    /*
     * Controls display order in checkout.
     */
    private Integer displayOrder;

    /*
     * Allows vendor to enable/disable
     * a pricing head without deleting it.
     */
    private Boolean active = true;
}