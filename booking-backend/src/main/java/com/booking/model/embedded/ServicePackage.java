package com.booking.model.embedded;

import com.booking.model.enums.ServicePackageType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ServicePackage {

    /*
     * Unique identifier for this package
     * within the service.
     */
    private String id;

    /*
     * Fixed package tier.
     *
     * Vendor cannot rename this.
     */
    private ServicePackageType type;

    /*
     * Price of this package.
     */
    private BigDecimal price;

    /*
     * Features included in this package.
     */
    private List<String> features;

    /*
     * Vendor can temporarily disable
     * a package.
     */
    private boolean active = true;
}