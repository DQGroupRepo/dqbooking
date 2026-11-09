package com.booking.dto.vendorservice;

import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.service.ServiceDetailSectionRequest;
import com.booking.dto.service.ServicePackageRequest;
import com.booking.dto.service.CateringDetailsRequest;
import com.booking.model.enums.DiscountType;
import com.booking.model.enums.ServiceCategory;
import com.booking.model.embedded.ServiceTag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class VendorServiceRequest {

    @NotBlank
    private String serviceName;

    @NotNull(message = "Category is required")
    private ServiceCategory category;

    private String description;

    private Integer capacity;

    private Integer durationHours;

    /** STAY configuration: default check-in time, e.g. 15:00. */
    private java.time.LocalTime checkInTime;

    /** STAY configuration: default check-out time, e.g. 10:00. */
    private java.time.LocalTime checkOutTime;

    /** Total room inventory managed by this service (if applicable). */
    private Integer totalRoomCapacity;

    @Valid
    private ContactInfoDto contactInfo;

    @Valid
    private BookingSettingsDto bookingSettings;

    private List<String> imageUrls;

    private List<String> facilities = new ArrayList<>();

    private List<String> amenities = new ArrayList<>();

    @Valid
    private List<ServiceDetailSectionRequest> detailSections =
            new ArrayList<>();

    private String location;

    private List<ServiceTag> tags = new ArrayList<>();

    private String address;

    /*
     * Pricing Configuration
     *
     * Optional during service creation.
     * If supplied,
     * a VendorServicePricing document
     * will automatically be created.
     */
    @Valid
    private VendorServicePricingRequest pricing;

    private Boolean bundleEnabled = false;
    private DiscountType bundleDiscountType;

    private BigDecimal bundleDiscountValue;

    private List<ServicePackageRequest> packages;
    @Valid
    private CateringDetailsRequest cateringDetails;

}