import type { BookingStats } from "../../../types/BookingStats";

import styles from "./BookingGrid.module.css";

interface Props {

    bookings: BookingStats[];

}

export default function BookingGrid({

    bookings

}: Props) {

    return (

        <table className={styles.table}>

            <thead>

                <tr>

                    <th>Booking</th>

                    <th>Customer</th>

                    <th>Service</th>

                    <th>Date</th>

                    <th>Amount</th>

                    <th>Status</th>

                    <th></th>

                </tr>

            </thead>

            <tbody>

                {

                    bookings.map(item => (

                        <tr key={item.id}>

                            <td>{item.bookingNumber}</td>

                            <td>{item.customerName}</td>

                            <td>{item.serviceName}</td>

                            <td>{item.eventDate}</td>

                            <td>₹ {item.amount.toLocaleString()}</td>

                            <td>

                                <span
                                    className={`${styles.badge} ${styles[item.status]}`}
                                >

                                    {item.status}

                                </span>

                            </td>

                            <td>

                                <button>

                                    View

                                </button>

                            </td>

                        </tr>

                    ))

                }

            </tbody>

        </table>

    );

}
