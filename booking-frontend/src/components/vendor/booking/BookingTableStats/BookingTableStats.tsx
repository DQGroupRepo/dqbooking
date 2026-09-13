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