package com.booking.dto.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminVendorResponse {

    private String id;

    private String email;

    private String firstName;

    private String lastName;

    private String phone;

    private String businessName;

    private String city;

    private String address;

    private String description;

    private Double rating;

    private Integer totalReviews;

    private Boolean verified;

    private String status;
}