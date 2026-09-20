package com.booking.dto.vendorservice;

import com.booking.dto.service.ServiceDetailSectionResponse;
import com.booking.dto.service.ServicePackageResponse;
import com.booking.model.enums.DiscountType;
import com.booking.model.enums.ServiceModerationStatus;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class VendorServiceResponse {

    private String id;

    private String serviceName;

    private String category;

    private String description;

    private Integer capacity;

    private Integer durationHours;

    /*
     * =========================================
     * SERVICE STATUS
     * =========================================
     */

    private Boolean active;

    private ServiceModerationStatus moderationStatus;

    private Boolean featured;

    // NEW
    private Boolean pricingConfigured;

    private ContactInfoDto contactInfo;

    private BookingSettingsDto bookingSettings;

    private List<String> imageUrls;

    private List<String> amenities;

    @Valid
    private List<ServiceDetailSectionResponse> detailSections =
            new ArrayList<>();

    private String location;

    private String address;

    private Boolean bundleEnabled;
    private DiscountType bundleDiscountType;

    private BigDecimal bundleDiscountValue;

    /*
     * ============================
     * PACKAGES
     * ============================
     */

    private List<ServicePackageResponse> packages;
}