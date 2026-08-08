import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CustomerBookingService from "../../services/CustomerBookingService";
import ReviewService from "../../services/ReviewService";

import StarRating from "../../components/StarRating/StarRating";

import type { CustomerBookingDetailsResponse } from "../../types/CustomerBookingDetailsResponse";

import "./Review.css";

const MAX_COMMENT_LENGTH = 1000;

const Review = () => {

    const { bookingId } = useParams();

    const navigate = useNavigate();

    const [booking, setBooking] =
        useState<CustomerBookingDetailsResponse | null>(null);

    const [rating, setRating] =
        useState(0);

    const [comment, setComment] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");


    /*
     * =========================================
     * LOAD BOOKING
     * =========================================
     */

    useEffect(() => {

        if (!bookingId) {

            setError("Booking ID is missing.");

            setLoading(false);

            return;

        }

        loadBooking();

    }, [bookingId]);


    async function loadBooking() {

        try {

            setLoading(true);

            setError("");

            const data =
                await CustomerBookingService.getBooking(
                    bookingId!
                );

            setBooking(data);

        }
        catch (error) {

            console.error(
                "Failed to load booking:",
                error
            );

            setError(
                "Unable to load booking details."
            );

        }
        finally {

            setLoading(false);

        }

    }


    /*
     * =========================================
     * COMMENT CHANGE
     * =========================================
     */

    function handleCommentChange(
        value: string
    ) {

        if (
            value.length >
            MAX_COMMENT_LENGTH
        ) {

            return;

        }

        setComment(value);

    }


    /*
     * =========================================
     * SUBMIT REVIEW
     * =========================================
     */

    async function handleSubmit() {

        if (!bookingId) {

            setError(
                "Booking ID is missing."
            );

            return;

        }

        if (rating === 0) {

            setError(
                "Please select a rating."
            );

            return;

        }

        if (!comment.trim()) {

            setError(
                "Please write a review."
            );

            return;

        }

        try {

            setSubmitting(true);

            setError("");

            await ReviewService.createReview({

                bookingId,

                rating,

                comment:
                    comment.trim()

            });

            alert(
                "Review submitted successfully."
            );

            navigate(
                `/customer/bookings/${bookingId}`
            );

        }
        catch (error) {

            console.error(
                "Failed to submit review:",
                error
            );

            setError(
                "Unable to submit review. Please try again."
            );

        }
        finally {

            setSubmitting(false);

        }

    }


    /*
     * =========================================
     * CANCEL
     * =========================================
     */

    function handleCancel() {

        navigate(
            `/customer/bookings/${bookingId}`
        );

    }


    /*
     * =========================================
     * LOADING
     * =========================================
     */

    if (loading) {

        return (

            <div className="review-page">

                <div className="review-loading">

                    Loading booking details...

                </div>

            </div>

        );

    }


    /*
     * =========================================
     * BOOKING NOT FOUND
     * =========================================
     */

    if (!booking) {

        return (

            <div className="review-page">

                <div className="review-error">

                    {error ||
                        "Booking not found."}

                </div>

            </div>

        );

    }


    return (

        <div className="review-page">

            <div className="review-container">


                {/* =====================================================
                    BREADCRUMBS
                ===================================================== */}

                <div className="review-breadcrumbs">

                    <span
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        Home
                    </span>

                    <span className="breadcrumb-arrow">
                        ›
                    </span>

                    <span
                        onClick={() =>
                            navigate(
                                "/customer/bookings"
                            )
                        }
                    >
                        My Bookings
                    </span>

                    <span className="breadcrumb-arrow">
                        ›
                    </span>

                    <span
                        onClick={() =>
                            navigate(
                                `/customer/bookings/${bookingId}`
                            )
                        }
                    >
                        Booking Details
                    </span>

                    <span className="breadcrumb-arrow">
                        ›
                    </span>

                    <span className="breadcrumb-current">
                        Write Review
                    </span>

                </div>


                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div className="review-header">

                    <h1>
                        Write a Review
                    </h1>

                    <p>
                        Share your experience and help others
                        make the right choice.
                    </p>

                </div>


                {/* =====================================================
                    MAIN TWO COLUMN LAYOUT
                ===================================================== */}

                <div className="review-layout">


                    {/* =================================================
                        LEFT - BOOKING SUMMARY
                    ================================================= */}

                    <div className="review-booking-card">

                        <h2>
                            Booking Summary
                        </h2>


                        {/* ---------------------------------------------
                            IMAGE
                        --------------------------------------------- */}

                        <div className="review-service-image">

                            <img
                                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3"
                                alt={
                                    booking.serviceName
                                }
                            />

                        </div>


                        {/* ---------------------------------------------
                            SERVICE NAME
                        --------------------------------------------- */}

                        <h3>
                            {booking.serviceName}
                        </h3>


                        {/* ---------------------------------------------
                            BOOKING DETAILS
                        --------------------------------------------- */}

                        <div className="booking-info-list">


                            {/* Booking ID */}

                            <div className="booking-info-item">

                                <div className="booking-info-icon">
                                    ◉
                                </div>

                                <div>

                                    <span>
                                        Booking ID
                                    </span>

                                    <strong>
                                        {booking.bookingNumber}
                                    </strong>

                                </div>

                            </div>


                            {/* Event Date */}

                            <div className="booking-info-item">

                                <div className="booking-info-icon">
                                    ▣
                                </div>

                                <div>

                                    <span>
                                        Event Date
                                    </span>

                                    <strong>
                                        {booking.eventDate}
                                    </strong>

                                </div>

                            </div>


                            {/* Event Type */}

                            <div className="booking-info-item">

                                <div className="booking-info-icon">
                                    ◇
                                </div>

                                <div>

                                    <span>
                                        Event Type
                                    </span>

                                    <strong>
                                        {booking.eventType}
                                    </strong>

                                </div>

                            </div>


                            {/* Guests */}

                            <div className="booking-info-item">

                                <div className="booking-info-icon">
                                    ♟
                                </div>

                                <div>

                                    <span>
                                        Guests
                                    </span>

                                    <strong>
                                        {booking.guestCount}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* ---------------------------------------------
                            INFORMATION BOX
                        --------------------------------------------- */}

                        <div className="review-visibility-info">

                            <span className="review-info-icon">
                                ⓘ
                            </span>

                            <p>
                                Your review will be visible to other
                                customers and help them choose the
                                best for their special events.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        RIGHT - REVIEW FORM
                    ================================================= */}

                    <div className="review-form-card">


                        <h2>
                            How was your experience?
                        </h2>


                        {/* ---------------------------------------------
                            RATING
                        --------------------------------------------- */}

                        <div className="review-rating-section">

                            <label>
                                Your Rating
                            </label>

                            <StarRating
                                value={rating}
                                onChange={setRating}
                            />

                            <p>

                                {rating === 0
                                    ? "Click on a star to rate"
                                    : `${rating} out of 5 stars`}

                            </p>

                        </div>


                        {/* ---------------------------------------------
                            DIVIDER
                        --------------------------------------------- */}

                        <div className="review-divider" />


                        {/* ---------------------------------------------
                            COMMENT
                        --------------------------------------------- */}

                        <div className="review-comment-section">

                            <h3>
                                Tell us about your experience
                            </h3>

                            <p>
                                Share details about the venue,
                                service quality, staff behavior,
                                and overall experience.
                            </p>


                            <div className="review-textarea-wrapper">

                                <textarea
                                    id="comment"
                                    value={comment}
                                    onChange={(e) =>
                                        handleCommentChange(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Write your review here..."
                                    rows={8}
                                    maxLength={
                                        MAX_COMMENT_LENGTH
                                    }
                                />

                                <span className="review-character-count">

                                    {comment.length} /{" "}
                                    {MAX_COMMENT_LENGTH}

                                </span>

                            </div>

                        </div>


                        {/* ---------------------------------------------
                            GUIDANCE
                        --------------------------------------------- */}

                        <div className="review-guidance">

                            <span className="review-guidance-icon">
                                ✓
                            </span>

                            <span>
                                Please keep your review respectful
                                and helpful. Avoid sharing personal
                                information.
                            </span>

                        </div>


                        {/* ---------------------------------------------
                            ERROR
                        --------------------------------------------- */}

                        {error && (

                            <div className="review-form-error">

                                {error}

                            </div>

                        )}


                        {/* ---------------------------------------------
                            ACTIONS
                        --------------------------------------------- */}

                        <div className="review-actions">

                            <button
                                type="button"
                                className="review-cancel-button"
                                onClick={handleCancel}
                                disabled={submitting}
                            >

                                <span>
                                    ×
                                </span>

                                Cancel

                            </button>


                            <button
                                type="button"
                                className="review-submit-button"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >

                                <span>
                                    {submitting
                                        ? "..."
                                        : "➤"}
                                </span>

                                {submitting
                                    ? "Submitting..."
                                    : "Submit Review"}

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default Review;