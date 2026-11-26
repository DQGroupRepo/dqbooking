import {
    useNavigate
} from "react-router-dom";

import styles
    from "./VendorBookingTable.module.css";

import type {
    RecentBooking
} from "../../../../types/RecentBooking";


interface VendorBookingTableProps {

    title:
        string;

    bookings:
        RecentBooking[];

}


export default function VendorBookingTable({

    title,

    bookings,

}: VendorBookingTableProps) {


    const navigate =
        useNavigate();


    const getInitials = (
        name: string
    ) => {


        if (!name) {
            return "--";
        }


        return name

            .split(" ")

            .filter(
                Boolean
            )

            .map(
                word =>
                    word[0]
            )

            .join("")

            .substring(
                0,
                2
            )

            .toUpperCase();

    };


    return (


        <div
            className={
                styles.container
            }
        >


            <div
                className={
                    styles.header
                }
            >


                <h2>

                    {title}

                </h2>


                <button

                    className={
                        styles.viewAll
                    }

                    onClick={() =>
                        navigate(
                            "/vendor/bookings"
                        )
                    }

                >

                    View All

                </button>


            </div>


            {

                bookings.length === 0

                    ? (

                        <div
                            className={
                                styles.emptyState
                            }
                        >

                            <p>
                                No booking requests yet.
                            </p>

                        </div>

                    )

                    : (

                        <div className={styles.tableScroll}>
                        <table
                            className={
                                styles.table
                            }
                        >


                            <thead>


                                <tr>


                                    <th>
                                        Customer
                                    </th>


                                    <th>
                                        Event
                                    </th>


                                    <th>
                                        Date
                                    </th>


                                    <th>
                                        Status
                                    </th>


                                    <th>
                                        Amount
                                    </th>


                                </tr>


                            </thead>


                            <tbody>


                                {

                                    bookings.map(
                                        booking => (

                                            <tr
                                                key={
                                                    booking.bookingId
                                                }
                                            >


                                                <td>


                                                    <div
                                                        className={
                                                            styles.customer
                                                        }
                                                    >


                                                        <div
                                                            className={
                                                                styles.avatar
                                                            }
                                                        >

                                                            {
                                                                getInitials(
                                                                    booking.customerName
                                                                )
                                                            }

                                                        </div>


                                                        <span>

                                                            {
                                                                booking.customerName
                                                            }

                                                        </span>


                                                    </div>


                                                </td>


                                                <td>

                                                    {
                                                        booking.serviceName
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        booking.eventDate
                                                    }

                                                </td>


                                                <td>


                                                    <span

                                                        className={
                                                            `${styles.status} ${
                                                                styles[
                                                                    booking.status.toLowerCase()
                                                                ]
                                                            }`
                                                        }

                                                    >

                                                        {
                                                            booking.status
                                                        }

                                                    </span>


                                                </td>


                                                <td
                                                    className={
                                                        styles.amount
                                                    }
                                                >

                                                    ₹
                                                    {
                                                        Number(
                                                            booking.amount ?? 0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )
                                                    }

                                                </td>


                                            </tr>

                                        )
                                    )

                                }


                            </tbody>


                        </table>
                        </div>

                    )

            }


        </div>


    );


}