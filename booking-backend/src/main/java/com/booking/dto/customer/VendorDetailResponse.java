package com.booking.dto.customer;

import com.booking.dto.service.ServiceDetailSectionResponse;
import com.booking.model.embedded.Availability;
import com.booking.model.embedded.BookingSettings;
import com.booking.model.embedded.ContactInfo;
import com.booking.model.embedded.ServicePackage;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class VendorDetailResponse {

    private String serviceId;

    private String vendorId;

    private String businessName;

    private String serviceName;

    private String description;

    private String category;

    private String city;

    private BigDecimal startingPrice;

    private Double rating;

    private Integer reviewCount;

    private Integer capacity;

    private List<String> imageUrls;

    private List<String> facilities;

    private List<String> amenities;

    private List<ServiceDetailSectionResponse> detailSections;

    private ContactInfo contactInfo;

    private BookingSettings bookingSettings;

    private Availability availability;

    private String location;

    private List<ServicePackage> packages;

}