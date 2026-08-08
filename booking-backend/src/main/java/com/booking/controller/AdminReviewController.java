package com.booking.controller;

import com.booking.dto.review.ReviewResponse;
import com.booking.service.AdminReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    @GetMapping
    public List<ReviewResponse> getAllReviews() {

        return adminReviewService.getAllReviews();

    }

    @DeleteMapping("/{reviewId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(
            @PathVariable String reviewId) {

        adminReviewService.deleteReview(reviewId);

    }

}