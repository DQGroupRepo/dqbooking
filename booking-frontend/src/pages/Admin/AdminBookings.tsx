import { useEffect, useMemo, useState } from "react";

import AdminBookingService from "../../services/AdminBookingService";

import type { AdminBooking }
    from "../../../types/AdminBooking";

import "./AdminBookings.css";

const AdminBookings = () => {

    const [bookings, setBookings] =
        useState<AdminBooking[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");


    useEffect(() => {

        loadBookings();

    }, []);


    async function loadBookings() {

        try {

            setLoading(true);
            setError("");

            const data =
                await AdminBookingService
                    .getBookings();

            setBookings(data);

        } catch (error) {

            console.error(
                "Failed to load admin bookings:",
                error
            );

            setError(
                "Unable to load bookings."
            );

        } finally {

            setLoading(false);

        }

    }


    const filteredBookings =
        useMemo(() => {

            return bookings.filter(
                (booking) => {

                    const searchText =
                        search
                            .toLowerCase()
                            .trim();

                    const matchesSearch =
                        !searchText ||
                        booking.bookingNumber
                            .toLowerCase()
                            .includes(searchText) ||
                        booking.customerName
                            .toLowerCase()
                            .includes(searchText) ||
                        booking.customerEmail
                            .toLowerCase()
                            .includes(searchText) ||
                        booking.serviceName
                            .toLowerCase()
                            .includes(searchText);


                    const matchesStatus =
                        statusFilter === "ALL" ||
                        booking.status === statusFilter;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );

        }, [
            bookings,
            search,
            statusFilter
        ]);


    function formatDate(
        value: string
    ) {

        if (!value) {
            return "—";
        }

        return new Date(value)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
    }


    function formatAmount(
        value: number
    ) {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(value || 0);

    }


    function formatStatus(
        status: string
    ) {

        return status
            .charAt(0)
            + status
                .slice(1)
                .toLowerCase();

    }


    if (loading) {

        return (

            <section className="admin-bookings">

                <div className="admin-bookings-loading">

                    Loading bookings...

                </div>

            </section>

        );

    }


    if (error) {

        return (

            <section className="admin-bookings">

                <div className="admin-bookings-error">

                    {error}

                </div>

            </section>

        );

    }


    return (

        <section className="admin-bookings">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="admin-bookings-header">

                <div>

                    <h1>
                        Bookings
                    </h1>

                    <p>
                        Monitor all bookings across the EventNest platform.
                    </p>

                </div>

            </div>


            {/* =========================================
                FILTER BAR
            ========================================= */}

            <div className="admin-bookings-toolbar">

                <div className="admin-bookings-search">

                    <span>
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search booking, customer or service..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="ALL">
                        All Statuses
                    </option>

                    <option value="PENDING">
                        Pending
                    </option>

                    <option value="CONFIRMED">
                        Confirmed
                    </option>

                    <option value="COMPLETED">
                        Completed
                    </option>

                    <option value="CANCELLED">
                        Cancelled
                    </option>

                    <option value="REJECTED">
                        Rejected
                    </option>

                </select>

            </div>


            {/* =========================================
                SUMMARY
            ========================================= */}

            <div className="admin-bookings-summary">

                Showing{" "}

                <strong>
                    {filteredBookings.length}
                </strong>

                {" "}of{" "}

                <strong>
                    {bookings.length}
                </strong>

                {" "}bookings

            </div>


            {/* =========================================
                TABLE
            ========================================= */}

            <div className="admin-bookings-card">

                {filteredBookings.length === 0 ? (

                    <div className="admin-bookings-empty">

                        <div className="admin-bookings-empty-icon">
                            📅
                        </div>

                        <h3>
                            No bookings found
                        </h3>

                        <p>
                            No bookings match your current search or filter.
                        </p>

                    </div>

                ) : (

                    <div className="admin-bookings-table-wrapper">

                        <table className="admin-bookings-table">

                            <thead>

                                <tr>

                                    <th>
                                        Booking
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Service
                                    </th>

                                    <th>
                                        Event Date
                                    </th>

                                    <th>
                                        Guests
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Payment
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredBookings.map(
                                    (booking) => (

                                        <tr
                                            key={booking.id}
                                        >

                                            {/* Booking */}

                                            <td>

                                                <div className="admin-booking-number">

                                                    <strong>
                                                        {booking.bookingNumber}
                                                    </strong>

                                                    <span>
                                                        {formatDate(
                                                            booking.createdAt
                                                        )}
                                                    </span>

                                                </div>

                                            </td>


                                            {/* Customer */}

                                            <td>

                                                <div className="admin-booking-customer">

                                                    <strong>
                                                        {booking.customerName ||
                                                            "Unknown"}
                                                    </strong>

                                                    <span>
                                                        {booking.customerEmail ||
                                                            "—"}
                                                    </span>

                                                </div>

                                            </td>


                                            {/* Service */}

                                            <td>

                                                <div className="admin-booking-service">

                                                    <strong>
                                                        {booking.serviceName ||
                                                            "Unknown"}
                                                    </strong>

                                                    <span>
                                                        {booking.eventType ||
                                                            "—"}
                                                    </span>

                                                </div>

                                            </td>


                                            {/* Event Date */}

                                            <td>

                                                <strong>
                                                    {formatDate(
                                                        booking.eventDate
                                                    )}
                                                </strong>

                                            </td>


                                            {/* Guests */}

                                            <td>

                                                {booking.guestCount}

                                            </td>


                                            {/* Amount */}

                                            <td>

                                                <strong>
                                                    {formatAmount(
                                                        booking.totalAmount
                                                    )}
                                                </strong>

                                            </td>


                                            {/* Payment */}

                                            <td>

                                                <span
                                                    className={
                                                        `admin-payment-badge ${
                                                            booking.paymentStatus
                                                                .toLowerCase()
                                                        }`
                                                    }
                                                >

                                                    {formatStatus(
                                                        booking.paymentStatus
                                                    )}

                                                </span>

                                            </td>


                                            {/* Status */}

                                            <td>

                                                <span
                                                    className={
                                                        `admin-booking-status ${
                                                            booking.status
                                                                .toLowerCase()
                                                        }`
                                                    }
                                                >

                                                    <span className="status-dot">
                                                    </span>

                                                    {formatStatus(
                                                        booking.status
                                                    )}

                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </section>

    );

};

export default AdminBookings;
