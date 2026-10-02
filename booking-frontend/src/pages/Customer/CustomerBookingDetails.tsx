import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CustomerBookingService from "../../services/CustomerBookingService";

import type { CustomerBookingDetailsResponse } from "../../types/CustomerBookingDetailsResponse";
import BookingSummaryCard from "../../components/customer/BookingSummaryCard";
import BookingVendorCard from "../../components/customer/BookingVendorCard";
import BookingPaymentCard from "../../components/customer/BookingPaymentCard";
import BookingPricingBreakdownCard from "../../components/customer/BookingPricingBreakdownCard";
import BookingRefundCard from "../../components/customer/BookingRefundCard";
import ReviewService from "../../services/ReviewService";

import "./CustomerBookingDetails.css";

export default function CustomerBookingDetails() {

    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] =
        useState<CustomerBookingDetailsResponse | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [reviewSubmitted, setReviewSubmitted] =
        useState(false);

    useEffect(() => {

        if (bookingId) {

            loadBooking(bookingId);

        }

    }, [bookingId]);

    async function loadBooking(id: string) {

        try {

            const response =
                await CustomerBookingService
                    .getBooking(id);

            setBooking(response);
            const reviews =
                await ReviewService.getCustomerReviews();

            const alreadyReviewed =
                reviews.some(
                    review =>
                        review.bookingId === id
                );

            setReviewSubmitted(alreadyReviewed);

        }

        finally {

            setLoading(false);

        }

    }

    if (loading) {

        return <div>Loading booking...</div>;

    }

    if (!booking) {

        return <div>Booking not found.</div>;

    }

    return (

        <div className="customer-booking-details">

            <h1>

                Booking Details

            </h1>

            <BookingSummaryCard
                booking={booking}
            />

            <BookingVendorCard
                booking={booking}
            />

            <BookingPaymentCard
                booking={booking}
            />

            <BookingPricingBreakdownCard
                booking={booking}
            />

            <BookingRefundCard
                booking={booking}
            />
            <button
                type="button"
                className="write-review-button"
                onClick={() =>
                    navigate(
                        `/customer/bookings/${booking.bookingId}/review`
                    )
                }
            >
                Write a Review
            </button>

            {booking.eventDate &&
                new Date(booking.eventDate) < new Date() &&
                booking.bookingStatus !== "CANCELLED" &&
                booking.bookingStatus !== "REJECTED" && (

                    reviewSubmitted ? (

                        <div className="review-submitted">
                            ✓ Review Submitted
                        </div>

                    ) : (

                        <button
                            type="button"
                            className="write-review-button"
                            onClick={() =>
                                navigate(
                                    `/customer/bookings/${booking.bookingId}/review`
                                )
                            }
                        >
                            Write a Review
                        </button>

                    )

                )}

        </div>

    );

}
