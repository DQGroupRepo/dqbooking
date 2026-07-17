package com.booking.controller;

import com.booking.dto.review.CreateReviewRequest;
import com.booking.dto.review.ReviewResponse;
import com.booking.dto.review.UpdateReviewRequest;
import com.booking.dto.review.ReviewReplyRequest;
import com.booking.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse createReview(
            @Valid @RequestBody CreateReviewRequest request) {

        return reviewService.createReview(request);
    }

    @PutMapping("/{reviewId}")
    public ReviewResponse updateReview(
            @PathVariable String reviewId,
            @Valid @RequestBody UpdateReviewRequest request) {

        return reviewService.updateReview(
                reviewId,
                request
        );
    }

    @GetMapping("/customer")
    public List<ReviewResponse> getCustomerReviews() {

        return reviewService.getCustomerReviews();
    }

    @GetMapping("/vendor")
    public List<ReviewResponse> getVendorReviews() {

        return reviewService.getVendorReviews();
    }

    @PostMapping("/{reviewId}/reply")
    public ReviewResponse replyToReview(
            @PathVariable String reviewId,
            @Valid @RequestBody ReviewReplyRequest request) {

        return reviewService.replyToReview(
                reviewId,
                request
        );
    }

    @DeleteMapping("/{reviewId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(
            @PathVariable String reviewId) {

        reviewService.deleteReview(reviewId);
    }

    @GetMapping("/{serviceId}/reviews")
    public List<ReviewResponse> getServiceReviews(
            @PathVariable String serviceId) {

        return reviewService.getServiceReviews(serviceId);
    }
}