package com.booking.service;

import com.booking.dto.review.ReviewResponse;

import java.util.List;

public interface AdminReviewService {

    List<ReviewResponse> getAllReviews();

    void deleteReview(String reviewId);

}