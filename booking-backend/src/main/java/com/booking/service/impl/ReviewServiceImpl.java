package com.booking.service.impl;

import com.booking.dto.review.*;
import com.booking.exception.*;
import com.booking.helper.ReviewHelper;
import com.booking.mapper.ReviewMapper;
import com.booking.model.*;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.NotificationType;
import com.booking.repository.*;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.NotificationService;
import com.booking.service.ReviewService;
import com.booking.service.VendorAccessService;
import com.booking.service.VendorPermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import com.booking.model.enums.VendorPage;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl
        implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final VendorServiceRepository vendorServiceRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;
    private final ReviewHelper reviewHelper;
    private final AuthenticatedUserService authenticatedUserService;
    private final VendorAccessService vendorAccessService;
    private final VendorPermissionService vendorPermissionService;
    private final NotificationService notificationService;

    @Override
    public ReviewResponse createReview(
            CreateReviewRequest request
    ) {

        User customer =
                authenticatedUserService.getCurrentCustomer();

        log.info("Creating review customerId={} bookingId={}",
                customer.getId(), request.getBookingId());

        Booking booking =
                bookingRepository.findById(request.getBookingId())
                        .orElseThrow(() ->
                                new BookingNotFoundException(
                                        "Booking not found"
                                ));

        if (!booking.getCustomerId().equals(customer.getId())) {

            log.warn("Review creation denied customerId={} bookingId={}",
                    customer.getId(), booking.getId());

            throw new ReviewNotAllowedException(
                    "You can review only your own bookings."
            );
        }

        if (booking.getStatus() == BookingStatus.CANCELLED ||
                booking.getStatus() == BookingStatus.REJECTED) {

            log.warn("Review creation rejected for booking status bookingId={} status={}",
                    booking.getId(), booking.getStatus());

            throw new ReviewNotAllowedException(
                    "Cancelled or rejected bookings cannot be reviewed."
            );
        }

        if (booking.getEventDate().isAfter(LocalDate.now())) {

            log.warn("Review creation rejected before event date bookingId={} eventDate={}",
                    booking.getId(), booking.getEventDate());

            throw new ReviewNotAllowedException(
                    "Review can be added only after the event."
            );
        }

        reviewRepository.findByBookingId(
                booking.getId()
        ).ifPresent(review -> {

            log.warn("Review already exists bookingId={} reviewId={}",
                    booking.getId(), review.getId());

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

        notificationService.createNotification(
                booking.getVendorId(),
                NotificationType.REVIEW,
                "New Review",
                customer.getFullName()
                        + " left a "
                        + review.getRating()
                        + "★ review for "
                        + booking.getServiceName(),
                review.getId()
        );

        log.info("Review created reviewId={} bookingId={} vendorId={} rating={}",
                review.getId(),
                booking.getId(),
                booking.getVendorId(),
                review.getRating());

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

        log.info("Updating review customerId={} reviewId={}",
                customer.getId(), reviewId);

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow(() ->
                                new ReviewNotFoundException(
                                        "Review not found"
                                ));

        if (!review.getCustomerId().equals(customer.getId())) {

            log.warn("Review update denied customerId={} reviewId={}",
                    customer.getId(), reviewId);

            throw new ReviewNotAllowedException(
                    "You can update only your own review."
            );
        }

        reviewHelper.updateReview(
                review,
                request
        );

        review = reviewRepository.save(review);

        log.info("Review updated reviewId={} customerId={}",
                reviewId, customer.getId());

        return buildReviewResponse(review);
    }

    @Override
    public void deleteReview(
            String reviewId
    ) {

        User customer =
                authenticatedUserService.getCurrentCustomer();

        log.info("Deleting review customerId={} reviewId={}",
                customer.getId(), reviewId);

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow(() ->
                                new ReviewNotFoundException(
                                        "Review not found"
                                ));

        if (!review.getCustomerId().equals(customer.getId())) {

            log.warn("Review deletion denied customerId={} reviewId={}",
                    customer.getId(), reviewId);

            throw new ReviewNotAllowedException(
                    "You can delete only your own review."
            );
        }

        review.setDeleted(true);
        review.setActive(false);

        reviewRepository.save(review);

        log.info("Review deleted reviewId={} customerId={}",
                reviewId, customer.getId());
    }

    @Override
    public ReviewResponse replyToReview(
            String reviewId,
            ReviewReplyRequest request
    ) {

        vendorPermissionService.checkEdit(
                VendorPage.REVIEWS
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        log.info("Replying to review vendorId={} reviewId={}",
                vendorId, reviewId);

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow(() ->
                                new ReviewNotFoundException(
                                        "Review not found"
                                ));

        if (!review.getVendorId().equals(vendorId)) {

            log.warn("Review reply denied vendorId={} reviewId={}",
                    vendorId, reviewId);

            throw new ReviewNotAllowedException(
                    "You cannot reply to this review."
            );
        }

        reviewHelper.prepareReply(
                review,
                request.getVendorReply()
        );

        review = reviewRepository.save(review);

        log.info("Review reply saved vendorId={} reviewId={}",
                vendorId, reviewId);

        return buildReviewResponse(review);
    }

    @Override
    public List<ReviewResponse> getVendorReviews() {

        vendorPermissionService.checkView(
                VendorPage.REVIEWS
        );

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        List<ReviewResponse> reviews =
                reviewRepository
                        .findByVendorIdAndDeletedFalse(vendorId)
                        .stream()
                        .map(this::buildReviewResponse)
                        .toList();

        log.info("Retrieved vendor reviews vendorId={} reviewCount={}",
                vendorId, reviews.size());

        return reviews;
    }

    @Override
    public List<ReviewResponse> getCustomerReviews() {

        User customer =
                authenticatedUserService.getCurrentCustomer();

        List<ReviewResponse> reviews =
                reviewRepository
                        .findByCustomerIdAndDeletedFalse(customer.getId())
                        .stream()
                        .map(this::buildReviewResponse)
                        .toList();

        log.info("Retrieved customer reviews customerId={} reviewCount={}",
                customer.getId(), reviews.size());

        return reviews;
    }

    @Override
    public List<ReviewResponse> getServiceReviews(String serviceId) {

        vendorPermissionService.checkView(
                VendorPage.REVIEWS
        );

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        log.info("Retrieving service reviews vendorId={} serviceId={}",
                vendorId, serviceId);

        VendorService service =
                vendorServiceRepository
                        .findById(serviceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Service not found"
                                )
                        );

        if (!vendorId.equals(service.getVendorId())) {

            log.warn("Service review access denied vendorId={} serviceId={}",
                    vendorId, serviceId);

            throw new AccessDeniedException(
                    "Access denied."
            );
        }

        List<ReviewResponse> reviews =
                reviewRepository
                        .findByServiceId(serviceId)
                        .stream()
                        .map(this::buildReviewResponse)
                        .toList();

        log.info("Retrieved service reviews vendorId={} serviceId={} reviewCount={}",
                vendorId, serviceId, reviews.size());

        return reviews;
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
