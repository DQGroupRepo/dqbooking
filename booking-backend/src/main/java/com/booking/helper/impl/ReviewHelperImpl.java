package com.booking.helper.impl;

import com.booking.dto.review.UpdateReviewRequest;
import com.booking.helper.ReviewHelper;
import com.booking.model.Review;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ReviewHelperImpl
        implements ReviewHelper {

    @Override
    public void prepareReview(
            Review review
    ) {

        review.setReviewDate(
                LocalDateTime.now()
        );

    }

    @Override
    public void prepareReply(
            Review review,
            String reply
    ) {

        review.setVendorReply(reply);

        review.setReplyDate(
                LocalDateTime.now()
        );

    }

    @Override
    public void updateReview(
            Review review,
            UpdateReviewRequest request
    ) {

        review.setRating(
                request.getRating()
        );

        review.setComment(
                request.getComment()
        );

    }

}