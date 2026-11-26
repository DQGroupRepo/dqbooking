import { useNavigate } from "react-router-dom";

import type { BookingStats } from "../../../../types/BookingStats";

import styles from "./BookingTableStats.module.css";

interface Props {
    bookings: BookingStats[];
}

export default function BookingTableStats({
    bookings
}: Props) {

    const navigate = useNavigate();

    const openBooking = (id: string) => {
        navigate(`/vendor/bookings/${id}`);
    };

    return (

        <div className={styles.tableWrapper}>

            <div className={styles.mobileBookingList}>
                {bookings.length === 0 ? (
                    <div className={styles.mobileEmptyState}>No bookings found.</div>
                ) : bookings.map((booking) => (
                    <article
                        key={booking.id}
                        className={styles.mobileBookingCard}
                        onClick={() => openBooking(booking.id)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openBooking(booking.id);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        <div className={styles.mobileCardTop}>
                            <strong>{booking.bookingNumber}</strong>
                            <span className={`${styles.status} ${styles[booking.status.toLowerCase()]}`}>
                                {booking.status}
                            </span>
                        </div>
                        <div className={styles.mobileCustomer}>{booking.customerName}</div>
                        <div className={styles.mobileService}>{booking.serviceName}</div>
                        <div className={styles.mobileCardMeta}>
                            <span><small>Event date</small><strong>{booking.eventDate}</strong></span>
                            <span><small>Amount</small><strong>₹{Number(booking.amount ?? 0).toLocaleString("en-IN")}</strong></span>
                        </div>
                        <button
                            type="button"
                            className={styles.mobileViewButton}
                            onClick={(event) => {
                                event.stopPropagation();
                                openBooking(booking.id);
                            }}
                        >View booking</button>
                    </article>
                ))}
            </div>

            <table className={styles.table}>

                <thead>

                    <tr>

                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Event Date</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    {bookings.length === 0 ? (

                        <tr>

                            <td
                                colSpan={7}
                                className={styles.emptyState}
                            >
                                No bookings found.
                            </td>

                        </tr>

                    ) : (

                        bookings.map((booking) => (

                            <tr
                                key={booking.id}
                                className={styles.clickableRow}
                                onClick={() => openBooking(booking.id)}
                            >

                                <td>{booking.bookingNumber}</td>

                                <td>{booking.customerName}</td>

                                <td>{booking.serviceName}</td>

                                <td>{booking.eventDate}</td>

                                <td>

                                    <span
                                        className={`${styles.status} ${styles[booking.status.toLowerCase()]}`}
                                    >
                                        {booking.status}
                                    </span>

                                </td>

                                <td>
                                    ₹{booking.amount.toLocaleString()}
                                </td>

                                <td>

                                    <button

                                        className={styles.viewBtn}

                                        onClick={(e) => {

                                            e.stopPropagation();

                                            openBooking(booking.id);

                                        }}

                                    >

                                        View

                                    </button>

                                </td>

                            </tr>

                        ))

                    )}

                </tbody>

            </table>

        </div>

    );

}
