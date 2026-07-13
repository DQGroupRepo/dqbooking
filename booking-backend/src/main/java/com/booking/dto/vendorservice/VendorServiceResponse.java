package com.booking.dto.vendorservice;

import com.booking.model.enums.ServiceCategory;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class VendorServiceResponse {

    private String id;

    private String serviceName;

    private String category;

    private String description;

    private BigDecimal price;

    private Integer capacity;

    private Integer durationHours;

    private Boolean active;

    private Boolean featured;

    private ContactInfoDto contactInfo;

    private AvailabilityDto availability;

    private BookingSettingsDto bookingSettings;

    private List<String> imageUrls;

    private List<String> amenities;

    private List<ServiceAttributeDto> attributes;

    private String location;

}