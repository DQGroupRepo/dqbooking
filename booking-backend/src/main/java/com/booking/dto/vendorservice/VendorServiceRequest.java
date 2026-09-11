package com.booking.dto.vendorservice;

import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.service.ServiceDetailSectionRequest;
import com.booking.dto.service.ServicePackageRequest;
import com.booking.model.enums.DiscountType;
import com.booking.model.enums.ServiceCategory;
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

    @NotNull
    private BigDecimal price;

    private Integer capacity;

    private Integer durationHours;

    @Valid
    private ContactInfoDto contactInfo;

    @Valid
    private AvailabilityDto availability;

    @Valid
    private BookingSettingsDto bookingSettings;

    private List<String> imageUrls;

    private List<String> amenities;

    @Valid
    private List<ServiceDetailSectionRequest> detailSections =
            new ArrayList<>();

    private String location;

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

}