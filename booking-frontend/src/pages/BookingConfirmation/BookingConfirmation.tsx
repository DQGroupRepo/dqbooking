import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./BookingConfirmation.css";

import { getBookingById } from "../../services/BookingService";

import type { Booking } from "../../types/Booking";
import BookingHeader from "../../components/booking/BookingHeader/BookingHeader";
import BookingSummary from "../../components/booking/BookingSummary/BookingSummary";
import CustomerSummary from "../../components/booking/CustomerSummary/CustomerSummary";
import PaymentSummary from "../../components/booking/PaymentSummary/PaymentSummary";
import PricingSummary from "../../components/booking/PricingSummary/PricingSummary";

const BookingConfirmation = () => {

    const { bookingId } = useParams();

    const navigate = useNavigate();

    const [booking, setBooking] =
        useState<Booking>();

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        if (!bookingId) return;

        loadBooking();

    }, [bookingId]);

    async function loadBooking() {

        try {

            const response =
                await getBookingById(
                    bookingId!
                );

            setBooking(response);

        }
        finally {

            setLoading(false);

        }

    }

    if (loading) {

        return (

            <div className="booking-confirmation-page">

                Loading booking...

            </div>

        );

    }

    if (!booking) {

        return (

            <div className="booking-confirmation-page">

                Booking not found.

            </div>

        );

    }

    return (

        <section className="booking-confirmation-page">

            <div className="confirmation-card">

                <BookingHeader

                    bookingNumber={booking.bookingNumber}

                    status={booking.status}

                />

                <div className="confirmation-layout">

                    <div className="confirmation-left">

                        <BookingSummary

                            booking={booking}

                        />

                        <CustomerSummary

                            name={booking.customerName}

                            phone={booking.customerPhone}

                            email={booking.customerEmail}

                        />

                    </div>

                    <div className="confirmation-right">

                        <PricingSummary

                            pricing={booking.pricing}

                        />



                    </div>

                </div>

                <div className="confirmation-buttons">

                    <button
                        className="primary"
                        onClick={() =>
                            navigate("/customer/bookings")
                        }
                    >
                        My Bookings
                    </button>

                    <button
                        className="secondary"
                        onClick={() => {
                            // TODO
                            // Generate booking confirmation PDF
                        }}
                    >
                        Download PDF
                    </button>

                    <button
                        className="secondary"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        Back to Home
                    </button>

                </div>

            </div>

        </section>

    );

};

export default BookingConfirmation;