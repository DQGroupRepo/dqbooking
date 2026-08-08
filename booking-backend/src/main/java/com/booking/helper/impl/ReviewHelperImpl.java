package com.booking.helper.impl;

import com.booking.dto.review.UpdateReviewRequest;
import com.booking.helper.ReviewHelper;
import com.booking.model.Review;
import com.booking.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

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
    public void updateVendorRating(
            User vendor,
            List<Review> reviews
    ) {

        if (reviews.isEmpty()) {

            vendor.setRating(0.0);

            vendor.setTotalReviews(0);

            return;

        }

        double average = reviews.stream()

                .mapToInt(Review::getRating)

                .average()

                .orElse(0);

        vendor.setRating(average);

        vendor.setTotalReviews(
                reviews.size()
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