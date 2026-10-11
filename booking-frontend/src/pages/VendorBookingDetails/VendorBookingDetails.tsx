import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import BookingStatsService from "../../services/BookingStatsService";

import type { BookingStats } from "../../types/BookingStats";

import styles from "./VendorBookingDetails.module.css";

export default function VendorBookingDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [booking, setBooking] =
        useState<BookingStats | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadBooking();

    }, [id]);

    const loadBooking = async () => {

        if (!id) {

            setLoading(false);

            return;

        }

        const response =
            await BookingStatsService.getBookingById(id!);

        if (response) {

            setBooking(response);

        }

        setLoading(false);

    };

    if (loading) {

        return (

            <div className={styles.loading}>

                Loading booking...

            </div>

        );

    }

    if (!booking) {

        return (

            <div className={styles.notFound}>

                <h2>Booking not found</h2>

                <button
                    onClick={() => navigate("/vendor/bookings")}
                >
                    Back
                </button>

            </div>

        );

    }

    const balance = booking.amount - booking.paidAmount;

    return (

        <div className={styles.container}>

            <button

                className={styles.backButton}

                onClick={() => navigate("/vendor/bookings")}

            >

                ← Back to Bookings

            </button>

            <div className={styles.header}>

                <div>

                    <h1>{booking.bookingNumber}</h1>

                    <p>{booking.serviceName}</p>

                </div>

                <span
                    className={`${styles.status} ${styles[booking.status.toLowerCase()]}`}
                >
                    {booking.status}
                </span>

            </div>

            <div className={styles.grid}>

                <div className={styles.card}>

                    <h2>Customer Information</h2>

                    <p><strong>Name:</strong> {booking.customerName}</p>

                    <p><strong>Phone:</strong> {booking.customerPhone}</p>

                    <p><strong>Email:</strong> {booking.customerEmail}</p>

                </div>

                <div className={styles.card}>

                    <h2>Event Information</h2>

                    <p><strong>Service:</strong> {booking.serviceName}</p>

                    <p><strong>Venue:</strong> {booking.venue}</p>

                    <p><strong>Date:</strong> {booking.eventDate}</p>

                    <p><strong>Guests:</strong> {booking.guestCount}</p>

                </div>

                <div className={styles.card}>

                    <h2>Payment</h2>

                    <p><strong>Total:</strong> ₹{booking.amount}</p>

                    <p><strong>Paid:</strong> ₹{booking.paidAmount}</p>

                    <p><strong>Balance:</strong> ₹{balance}</p>

                    <p>
                        <strong>Payment Status:</strong>{" "}
                        {booking.paymentStatus}
                    </p>

                </div>

                <div className={styles.card}>

                    <h2>Notes</h2>

                    <p>{booking.notes}</p>

                </div>

            </div>

            <div className={styles.actions}>

                <button className={styles.confirmButton}>

                    Confirm Booking

                </button>

                <button className={styles.completeButton}>

                    Mark Completed

                </button>

            </div>

        </div>

    );

}