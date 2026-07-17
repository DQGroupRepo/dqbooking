package com.booking.service.impl;

import com.booking.dto.review.*;
import com.booking.exception.*;
import com.booking.helper.ReviewHelper;
import com.booking.mapper.ReviewMapper;
import com.booking.model.*;
import com.booking.model.enums.BookingStatus;
import com.booking.repository.*;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl
        implements ReviewService {

    private final ReviewRepository reviewRepository;

    private final BookingRepository bookingRepository;

    private final VendorRepository vendorRepository;

    private final VendorServiceRepository vendorServiceRepository;

    private final UserRepository userRepository;

    private final ReviewMapper reviewMapper;

    private final ReviewHelper reviewHelper;

    private final AuthenticatedUserService authenticatedUserService;

    @Override
    public ReviewResponse createReview(
            CreateReviewRequest request
    ) {

        User customer =
                authenticatedUserService.getCurrentCustomer();

        Booking booking =
                bookingRepository.findById(request.getBookingId())
                        .orElseThrow(() ->
                                new BookingNotFoundException(
                                        "Booking not found"
                                ));

        if (!booking.getCustomerId().equals(customer.getId())) {

            throw new ReviewNotAllowedException(
                    "You can review only your own bookings."
            );

        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {

            throw new ReviewNotAllowedException(
                    "Cancelled bookings cannot be reviewed."
            );

        }

        if (booking.getEventDate().isAfter(LocalDate.now())) {

            throw new ReviewNotAllowedException(
                    "Review can be added only after the event."
            );

        }

        reviewRepository.findByBookingId(
                booking.getId()
        ).ifPresent(review -> {

            throw new ReviewAlreadyExistsException(
                    booking.getBookingNumber()
            );

        });

        Review review = new Review();

        review.setBookingId(booking.getId());

        review.setVendorId(booking.getVendorId());

        review.setCustomerId(customer.getId());

        review.setServiceId(booking.getServiceId());

        review.setRating(request.getRating());

        review.setComment(request.getComment());

        reviewHelper.prepareReview(review);

        review = reviewRepository.save(review);

        Vendor vendor =
                vendorRepository.findById(
                        booking.getVendorId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Vendor not found"
                        ));

        reviewHelper.updateVendorRating(
                vendor,
                reviewRepository.findByVendorIdAndDeletedFalse(
                        vendor.getId()
                )
        );

        vendorRepository.save(vendor);

        ReviewResponse response =
                reviewMapper.toResponse(review);

        return ReviewResponse.builder()

                .id(response.getId())

                .bookingId(response.getBookingId())

                .rating(response.getRating())

                .comment(response.getComment())

                .vendorReply(response.getVendorReply())

                .reviewDate(response.getReviewDate())

                .replyDate(response.getReplyDate())

                .customerName(customer.getFullName())

                .customerEmail(customer.getEmail())

                .customerProfileImage(response.getCustomerProfileImage())

                .serviceName(booking.getServiceName())

                .build();

    }

    @Override
    public ReviewResponse updateReview(
            String reviewId,
            UpdateReviewRequest request
    ) {

        User customer =
                authenticatedUserService.getCurrentCustomer();

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow(() ->
                                new ReviewNotFoundException(
                                        "Review not found"
                                ));

        if (!review.getCustomerId().equals(customer.getId())) {

            throw new ReviewNotAllowedException(
                    "You can update only your own review."
            );

        }

        reviewHelper.updateReview(
                review,
                request
        );

        review = reviewRepository.save(review);

        return buildReviewResponse(review);

    }

    @Override
    public void deleteReview(
            String reviewId
    ) {

        User customer =
                authenticatedUserService.getCurrentCustomer();

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow(() ->
                                new ReviewNotFoundException(
                                        "Review not found"
                                ));

        if (!review.getCustomerId().equals(customer.getId())) {

            throw new ReviewNotAllowedException(
                    "You can delete only your own review."
            );

        }

        review.setDeleted(true);

        review.setActive(false);

        reviewRepository.save(review);

    }

    @Override
    public ReviewResponse replyToReview(
            String reviewId,
            ReviewReplyRequest request
    ) {

        Vendor vendor =
                authenticatedUserService.getCurrentVendor();

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow(() ->
                                new ReviewNotFoundException(
                                        "Review not found"
                                ));

        if (!review.getVendorId().equals(vendor.getId())) {

            throw new ReviewNotAllowedException(
                    "You cannot reply to this review."
            );

        }

        reviewHelper.prepareReply(
                review,
                request.getVendorReply()
        );

        review = reviewRepository.save(review);

        return buildReviewResponse(review);

    }

    @Override
    public List<ReviewResponse> getVendorReviews() {

        Vendor vendor =
                authenticatedUserService.getCurrentVendor();

        return reviewRepository

                .findByVendorIdAndDeletedFalse(
                        vendor.getId()
                )

                .stream()

                .map(this::buildReviewResponse)

                .toList();

    }

    @Override
    public List<ReviewResponse> getCustomerReviews() {

        User customer =
                authenticatedUserService.getCurrentCustomer();

        return reviewRepository

                .findByCustomerIdAndDeletedFalse(
                        customer.getId()
                )

                .stream()

                .map(this::buildReviewResponse)

                .toList();

    }

    @Override
    public List<ReviewResponse> getServiceReviews(String serviceId) {

        String vendorId = authenticatedUserService
                .getCurrentVendor()
                .getId();

        VendorService service = vendorServiceRepository
                .findById(serviceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Service not found"));

        if (!service.getVendorId().equals(vendorId)) {
            throw new AccessDeniedException("Access denied.");
        }

        return reviewRepository
                .findByServiceId(serviceId)
                .stream()
                .map(reviewMapper::toResponse)
                .toList();

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
