import styles from "./VendorBookingTable.module.css";
import type { RecentBooking } from "../../../../types/RecentBooking";

interface VendorBookingTableProps {
  title: string;
  bookings: RecentBooking[];
}

export default function VendorBookingTable({
  title,
  bookings,
}: VendorBookingTableProps) {

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  return (
    <div className={styles.container}>

      <div className={styles.header}>

        <h2>{title}</h2>

        <button className={styles.viewAll}>
          View All
        </button>

      </div>

      <table className={styles.table}>

        <thead>

          <tr>

            <th>Customer</th>

            <th>Event</th>

            <th>Date</th>

            <th>Status</th>

            <th>Amount</th>

          </tr>

        </thead>

        <tbody>

          {bookings.map((booking) => (

            <tr key={booking.id}>

              <td>

                <div className={styles.customer}>

                  <div className={styles.avatar}>
                    {getInitials(booking.customerName)}
                  </div>

                  <span>{booking.customerName}</span>

                </div>

              </td>

              <td>{booking.serviceName}</td>

              <td>{booking.eventDate}</td>

              <td>

                <span
                  className={`${styles.status} ${styles[
                    booking.status.toLowerCase()
                  ]}`}
                >
                  {booking.status}
                </span>

              </td>

              <td className={styles.amount}>
                ₹{booking.amount.toLocaleString("en-IN")}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}