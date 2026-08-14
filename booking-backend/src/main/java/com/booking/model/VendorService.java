package com.booking.model;

import com.booking.model.embedded.Availability;
import com.booking.model.embedded.BookingSettings;
import com.booking.model.embedded.ContactInfo;
import com.booking.model.enums.DiscountType;
import com.booking.model.enums.ServiceCategory;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;
import com.booking.model.enums.ServiceModerationStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

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

    private Boolean featured = false;

    private Integer displayOrder = 0;

    private ContactInfo contactInfo;

    private Availability availability;

    private BookingSettings bookingSettings;

    private List<String> imageUrls;

    private List<String> amenities;

    private List<ServiceAttribute> attributes;

    private String location;

    private ServiceModerationStatus moderationStatus =
            ServiceModerationStatus.PENDING;

    private Boolean bundleEnabled = false;
    private DiscountType bundleDiscountType;

    private BigDecimal bundleDiscountValue;

}