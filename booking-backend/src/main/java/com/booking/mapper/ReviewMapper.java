package com.booking.mapper;

import com.booking.dto.review.ReviewResponse;
import com.booking.model.Review;

public interface ReviewMapper {

    ReviewResponse toResponse(Review review);

}