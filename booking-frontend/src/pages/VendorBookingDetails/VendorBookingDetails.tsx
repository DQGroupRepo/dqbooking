import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import BookingStatsService from "../../services/BookingStatsService";
import { cancelBooking, getCancellationPreview } from "../../services/BookingService";
import type { CancellationPreview } from "../../types/CancellationPreview";

import type { BookingStats } from "../../types/BookingStats";

import styles from "./VendorBookingDetails.module.css";

export default function VendorBookingDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [booking, setBooking] =
        useState<BookingStats | null>(null);

    const [loading, setLoading] = useState(true);
    const [cancellationPreview, setCancellationPreview] = useState<CancellationPreview | null>(null);
    const [showContactCustomer, setShowContactCustomer] = useState(false);
    const [cancellationLoading, setCancellationLoading] = useState(false);

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

    const balance = booking.status === "Cancelled"
        ? 0
        : Math.max(0, booking.amount - booking.paidAmount);

    const openCancellation = async () => {
        if (!booking.vendorCanCancel) {
            setShowContactCustomer(true);
            return;
        }
        try {
            setCancellationLoading(true);
            const preview = await getCancellationPreview(booking.id);
            setCancellationPreview(preview);
        } catch (error: any) {
            window.alert(error?.response?.data?.message || error?.message || "Unable to calculate the cancellation amount.");
        } finally {
            setCancellationLoading(false);
        }
    };

    const confirmCancellation = async () => {
        if (!booking) return;
        try {
            setCancellationLoading(true);
            await cancelBooking(booking.id);
            setCancellationPreview(null);
            await loadBooking();
        } catch (error: any) {
            window.alert(error?.response?.data?.message || error?.message || "Cancellation failed.");
        } finally {
            setCancellationLoading(false);
        }
    };

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

                    <p><strong>Check-in / Start:</strong> {booking.bookingFrom ? booking.bookingFrom.slice(0, 10) : booking.eventDate}</p>
                    {booking.bookingTo && <p><strong>Check-out / End:</strong> {booking.bookingTo.slice(0, 10)}</p>}
                    {booking.slotName && (
                        <p><strong>Time Slot:</strong> {booking.slotName}
                            {(booking.slotStartTime || booking.slotEndTime) && (
                                <> ({booking.slotStartTime ?? ""}{booking.slotEndTime ? ` - ${booking.slotEndTime}` : ""})</>
                            )}
                        </p>
                    )}
                    {String(booking.serviceCategory ?? "").toUpperCase() === "STAY" && (
                        <>
                            {booking.resourceTypeName && <p><strong>Room Type:</strong> {booking.resourceTypeName}</p>}
                            {booking.roomQuantity != null && <p><strong>Room Quantity:</strong> {booking.roomQuantity}</p>}
                            {!!(booking.resourceNames?.length || booking.resourceIds?.length) && <p><strong>Allocated Rooms:</strong> {(booking.resourceNames?.length ? booking.resourceNames : booking.resourceIds).join(", ")}</p>}
                        </>
                    )}
                    <p><strong>Guests:</strong> {booking.guestCount ?? "—"}</p>

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

            {booking.status.toLowerCase() !== "cancelled" && booking.status.toLowerCase() !== "canceled" && (
                <div className={styles.actions}>
                    <button className={styles.confirmButton}>
                        Confirm Booking
                    </button>
                    <button className={styles.completeButton}>
                        Mark Completed
                    </button>
                    {booking.status !== "Completed" && (
                        <button
                            className={styles.cancelButton}
                            onClick={openCancellation}
                            disabled={cancellationLoading}
                        >
                            {cancellationLoading ? "Please wait..." : "Cancel Booking"}
                        </button>
                    )}
                </div>
            )}

            {showContactCustomer && (
                <div className={styles.modalBackdrop} role="presentation" onClick={() => setShowContactCustomer(false)}>
                    <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="contact-customer-title" onClick={(event) => event.stopPropagation()}>
                        <h2 id="contact-customer-title">Customer cancellation required</h2>
                        <p>This booking was created by the customer. Please contact {booking.customerName || "the customer"} and ask them to cancel the booking from their account.</p>
                        <div className={styles.modalActions}>
                            <button type="button" onClick={() => setShowContactCustomer(false)}>Close</button>
                        </div>
                    </section>
                </div>
            )}

            {cancellationPreview && (
                <div className={styles.modalBackdrop} role="presentation" onClick={() => !cancellationLoading && setCancellationPreview(null)}>
                    <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="cancel-booking-title" onClick={(event) => event.stopPropagation()}>
                        <h2 id="cancel-booking-title">Confirm booking cancellation</h2>
                        <p>Cancellation is calculated using the cancellation policy configured for this service.</p>
                        <div className={styles.cancellationBreakdown}>
                            <div><span>Amount paid</span><strong>₹{Number(cancellationPreview.paidAmount || 0).toLocaleString("en-IN")}</strong></div>
                            <div><span>Cancellation charge</span><strong>₹{Number(cancellationPreview.cancellationCharge || 0).toLocaleString("en-IN")}</strong></div>
                            <div><span>Refund amount</span><strong>₹{Number(cancellationPreview.refundableAmount || 0).toLocaleString("en-IN")}</strong></div>
                        </div>
                        <p className={styles.modalNote}>No outstanding balance will be created. Any applicable refund will follow the configured processing period.</p>
                        <div className={styles.modalActions}>
                            <button type="button" className={styles.keepBookingButton} disabled={cancellationLoading} onClick={() => setCancellationPreview(null)}>Keep Booking</button>
                            <button type="button" className={styles.confirmCancelButton} disabled={cancellationLoading} onClick={confirmCancellation}>{cancellationLoading ? "Cancelling..." : "Confirm Cancellation"}</button>
                        </div>
                    </section>
                </div>
            )}

        </div>

    );

}