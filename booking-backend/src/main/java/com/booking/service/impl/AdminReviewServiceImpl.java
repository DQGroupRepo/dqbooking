package com.booking.service.impl;

import com.booking.dto.review.ReviewResponse;
import com.booking.exception.ReviewNotFoundException;
import com.booking.mapper.ReviewMapper;
import com.booking.model.Review;
import com.booking.model.User;
import com.booking.model.VendorService;
import com.booking.repository.ReviewRepository;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.AdminReviewService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminReviewServiceImpl
        implements AdminReviewService {

    private static final Logger log =
            LoggerFactory.getLogger(AdminReviewServiceImpl.class);

    private final ReviewRepository reviewRepository;

    private final UserRepository userRepository;

    private final VendorServiceRepository vendorServiceRepository;

    private final ReviewMapper reviewMapper;

    @Override
    public List<ReviewResponse> getAllReviews() {

        log.info("Admin requested all active reviews");

        List<ReviewResponse> reviews =
                reviewRepository
                        .findAll()
                        .stream()
                        .filter(review ->
                                !Boolean.TRUE.equals(
                                        review.getDeleted()
                                )
                        )
                        .map(this::buildReviewResponse)
                        .toList();

        log.info(
                "Admin review list retrieved count={}",
                reviews.size()
        );

        return reviews;
    }

    @Override
    public void deleteReview(
            String reviewId
    ) {

        log.info(
                "Admin deleting review reviewId={}",
                reviewId
        );

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Admin attempted to delete non-existent review reviewId={}",
                                    reviewId
                            );

                            return new ReviewNotFoundException(
                                    "Review not found"
                            );
                        });

        review.setDeleted(true);
        review.setActive(false);

        reviewRepository.save(review);

        log.info(
                "Review deleted successfully reviewId={}",
                reviewId
        );
    }

    private ReviewResponse buildReviewResponse(
            Review review
    ) {

        ReviewResponse response =
                reviewMapper.toResponse(review);

        User customer =
                userRepository.findById(
                        review.getCustomerId()
                ).orElse(null);

        VendorService service =
                vendorServiceRepository.findById(
                        review.getServiceId()
                ).orElse(null);

        return ReviewResponse.builder()

                .id(response.getId())

                .bookingId(response.getBookingId())

                .rating(response.getRating())

                .comment(response.getComment())

                .vendorReply(response.getVendorReply())

                .reviewDate(response.getReviewDate())

                .replyDate(response.getReplyDate())

                .customerName(
                        customer != null
                                ? customer.getFullName()
                                : "Unknown"
                )

                .customerEmail(
                        customer != null
                                ? customer.getEmail()
                                : null
                )

                .customerProfileImage(
                        response.getCustomerProfileImage()
                )

                .serviceName(
                        service != null
                                ? service.getServiceName()
                                : "Unknown"
                )

                .build();
    }
}