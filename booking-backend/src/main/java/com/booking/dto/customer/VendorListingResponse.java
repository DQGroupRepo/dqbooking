package com.booking.dto.customer;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class VendorListingResponse {

    private String serviceId;

    private String serviceName;

    private String businessName;

    private String description;

    private String category;

    private String city;

    private BigDecimal startingPrice;

    private Double rating;

    private Integer reviewCount;

    private Integer capacity;

    private String imageUrl;

    private List<String> gallery;

    private List<String> facilities;

    private List<String> amenities;

    private Boolean isActive;
}