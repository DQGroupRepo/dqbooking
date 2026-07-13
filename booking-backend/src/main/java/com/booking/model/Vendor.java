package com.booking.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "vendors")
public class Vendor extends BaseEntity {

    private String userId;

    private String businessName;

    private String ownerName;

    private String phone;

    private String city;

    private String address;

    private String description;

    private Double rating = 0.0;

    private Integer totalReviews = 0;

    private Boolean verified = false;

}