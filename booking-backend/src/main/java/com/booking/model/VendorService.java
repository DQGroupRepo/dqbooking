package com.booking.model;

import com.booking.model.embedded.*;
import com.booking.model.enums.DiscountType;
import com.booking.model.enums.ServiceCategory;
import com.booking.model.enums.ServiceDiscoveryTag;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;
import com.booking.model.enums.ServiceModerationStatus;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Document(collection = "vendor_services")
public class VendorService extends BaseEntity {

    private String vendorId;

    private String serviceName;

    private ServiceCategory category;

    private String description;

    private BigDecimal price;

    private Integer capacity;

    private Integer durationHours;

    private Integer displayOrder = 0;

    private ContactInfo contactInfo;

    private Availability availability;

    private BookingSettings bookingSettings;

    private List<String> imageUrls;

    private List<String> amenities;

    private List<ServiceDetailSection> detailSections =
            new ArrayList<>();

    private String location;

    private ServiceModerationStatus moderationStatus =
            ServiceModerationStatus.PENDING;

    private Boolean bundleEnabled = false;
    private DiscountType bundleDiscountType;

    private BigDecimal bundleDiscountValue;

    /*
     * =========================================
     * SERVICE PACKAGES
     * =========================================
     *
     * A service may have:
     *
     * 0 packages
     * 1 package
     * 2 packages
     * 3 packages
     *
     * Maximum supported tiers:
     *
     * SILVER
     * GOLD
     * PREMIUM
     */

    private List<ServicePackage> packages;

    private Set<ServiceDiscoveryTag> discoveryTags;

}