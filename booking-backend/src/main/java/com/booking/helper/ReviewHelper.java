package com.booking.helper;

import com.booking.dto.review.UpdateReviewRequest;
import com.booking.model.Review;

public interface ReviewHelper {

    void prepareReview(
            Review review
    );

    void prepareReply(
            Review review,
            String reply
    );

    void updateReview(
            Review review,
            UpdateReviewRequest request
    );

}