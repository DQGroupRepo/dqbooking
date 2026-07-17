package com.booking.service;

import com.booking.dto.review.*;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(
            CreateReviewRequest request
    );

    ReviewResponse updateReview(
            String reviewId,
            UpdateReviewRequest request
    );

    void deleteReview(
            String reviewId
    );

    ReviewResponse replyToReview(
            String reviewId,
            ReviewReplyRequest request
    );

    List<ReviewResponse> getVendorReviews();

    List<ReviewResponse> getCustomerReviews();

    List<ReviewResponse> getServiceReviews(String serviceId);

}