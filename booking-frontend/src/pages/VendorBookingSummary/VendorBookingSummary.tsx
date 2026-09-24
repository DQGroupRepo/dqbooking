import { useEffect, useState } from "react";

import BookingStatsCard from "../../components/vendor/booking/BookingStatsCard/BookingStatsCard";
import BookingFilter from "../../components/vendor/booking/BookingFilter/BookingFilter";
import BookingTableStats from "../../components/vendor/booking/BookingTableStats/BookingTableStats";
import BookingCalendar from "../../components/vendor/booking/BookingCalendar/BookingCalendar";

import BookingStatsService from "../../services/BookingStatsService";

import type { BookingStats } from "../../../types/BookingStats";

import styles from "./VendorBookingSummary.module.css";

export default function VendorBookingSummary() {

    const [bookings, setBookings] = useState<BookingStats[]>([]);

    const [activeFilter, setActiveFilter] = useState("All");

    useEffect(() => {

        loadBookings();

    }, []);

    const loadBookings = async () => {

        const response = await BookingStatsService.getBookings();

        setBookings(response);

    };

    const getCount = (status: string) =>
        bookings.filter(
            booking => booking.status === status
        ).length;

    const filteredBookings =
        activeFilter === "All"
            ? bookings
            : bookings.filter(
                  booking => booking.status === activeFilter
              );

    return (

        <div className={styles.container}>

            <div className={styles.header}>

                <h1>Bookings</h1>

                <p>Manage all your customer bookings.</p>

            </div>

            <div className={styles.statsGrid}>

                <BookingStatsCard
                    title="Upcoming"
                    value={getCount("Upcoming")}
                />

                <BookingStatsCard
                    title="Pending"
                    value={getCount("Pending")}
                />

                <BookingStatsCard
                    title="Confirmed"
                    value={getCount("Confirmed")}
                />

                <BookingStatsCard
                    title="Completed"
                    value={getCount("Completed")}
                />

                <BookingStatsCard
                    title="Cancelled"
                    value={getCount("Cancelled")}
                />

            </div>

            <BookingCalendar
                bookings={bookings}
            />

            <BookingFilter

                active={activeFilter}

                onChange={setActiveFilter}

            />

            <BookingTableStats

                bookings={filteredBookings}

            />

        </div>

    );

}