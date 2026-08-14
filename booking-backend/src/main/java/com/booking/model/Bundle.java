package com.booking.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Document(collection = "bundles")
public class Bundle extends BaseEntity {

    /*
     * =========================================
     * VENDOR
     * =========================================
     */

    private String vendorId;

    /*
     * =========================================
     * BUNDLE DETAILS
     * =========================================
     */

    private String name;

    private String description;

    /*
     * Services included in this bundle.
     */

    private List<String> serviceIds;

    /*
     * =========================================
     * DISCOUNT
     * =========================================
     *
     * Example:
     *
     * PERCENTAGE + 10
     * FIXED + 5000
     */

    private String discountType;

    private BigDecimal discountValue;

    /*
     * =========================================
     * STATUS
     * =========================================
     */

    private boolean active = true;
}