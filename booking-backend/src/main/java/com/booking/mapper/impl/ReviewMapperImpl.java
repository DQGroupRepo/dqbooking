package com.booking.mapper.impl;

import com.booking.dto.review.ReviewResponse;
import com.booking.mapper.ReviewMapper;
import com.booking.model.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapperImpl
        implements ReviewMapper {

    @Override
    public ReviewResponse toResponse(
            Review review
    ) {

        return ReviewResponse.builder()

                .id(review.getId())

                .bookingId(review.getBookingId())

                .rating(review.getRating())

                .comment(review.getComment())

                .vendorReply(review.getVendorReply())

                .reviewDate(review.getReviewDate())

                .replyDate(review.getReplyDate())

                /*
                 * These will be populated
                 * inside ReviewServiceImpl.
                 */
                .customerName(null)

                .serviceName(null)

                .customerProfileImage(null)

                .build();

    }

}