package com.booking.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "reviews")
public class Review extends BaseEntity {

    private String bookingId;

    private String vendorId;

    private String customerId;

    private String serviceId;

    private Integer rating;

    private String comment;

    private String vendorReply;

    private LocalDateTime reviewDate;

    private LocalDateTime replyDate;

}