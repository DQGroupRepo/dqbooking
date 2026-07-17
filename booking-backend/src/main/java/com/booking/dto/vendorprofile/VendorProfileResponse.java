package com.booking.dto.vendorprofile;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VendorProfileResponse {

    private String id;

    private String businessName;

    private String ownerName;

    private String phone;

    private String city;

    private String address;

    private String description;

    private Double rating;

    private Integer totalReviews;

    private Boolean verified;

}