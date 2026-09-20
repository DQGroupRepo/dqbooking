package com.booking.model;

import com.booking.model.embedded.*;
import com.booking.model.enums.DiscountType;
import com.booking.model.enums.ServiceCategory;
import com.booking.model.enums.ServiceDiscoveryTag;
import com.booking.model.enums.ServiceModerationStatus;

import lombok.Getter;
import lombok.Setter;

import org.springframework.data.mongodb.core.mapping.Document;

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

    private BigDecimal startingPrice;

    private Integer capacity;

    private Integer durationHours;

    private Integer displayOrder = 0;


    /*
     * =========================================
     * SERVICE STATUS
     * =========================================
     */

    private ServiceModerationStatus moderationStatus =
            ServiceModerationStatus.PENDING;


    /*
     * =========================================
     * CONTACT / AVAILABILITY / BOOKING
     * =========================================
     */

    private ContactInfo contactInfo;

    private BookingSettings bookingSettings;


    /*
     * =========================================
     * MEDIA / DETAILS
     * =========================================
     */

    private List<String> imageUrls;

    private List<String> amenities;

    private List<ServiceDetailSection> detailSections =
            new ArrayList<>();


    /*
     * =========================================
     * LOCATION
     * =========================================
     */

    private String location;

    /*
     * =========================================
     * BUNDLE CONFIGURATION
     * =========================================
     */

    private Boolean bundleEnabled = false;

    private DiscountType bundleDiscountType;

    private BigDecimal bundleDiscountValue;


    /*
     * =========================================
     * SERVICE PACKAGES
     * =========================================
     */

    private List<ServicePackage> packages;


    /*
     * =========================================
     * DISCOVERY
     * =========================================
     */

    private Set<ServiceDiscoveryTag> discoveryTags;

}