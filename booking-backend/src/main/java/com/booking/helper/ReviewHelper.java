package com.booking.helper;

import com.booking.dto.review.UpdateReviewRequest;
import com.booking.model.Review;
import com.booking.model.Vendor;

import java.util.List;

public interface ReviewHelper {

    void prepareReview(
            Review review
    );

    void prepareReply(
            Review review,
            String reply
    );

    void updateVendorRating(
            Vendor vendor,
            List<Review> reviews
    );

    void updateReview(
            Review review,
            UpdateReviewRequest request
    );

}