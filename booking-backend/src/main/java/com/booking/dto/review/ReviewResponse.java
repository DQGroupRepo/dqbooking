package com.booking.dto.review;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewResponse {

    private String id;

    private String bookingId;

    private Integer rating;

    private String comment;

    private String vendorReply;

    private LocalDateTime reviewDate;

    private LocalDateTime replyDate;

    private String customerName;

    private String serviceName;

    private String customerProfileImage;

    private String customerEmail;
}