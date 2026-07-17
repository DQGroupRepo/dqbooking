import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import BookingStatsService from "../../services/BookingStatsService";

import type { BookingStats } from "../../types/BookingStats";

import BookingTableStats from "../../components/vendor/bookings/BookingTableStats";

import "./VendorServiceBookings.css";

export default function VendorServiceBookings() {

    const { id } = useParams();

    const [bookings, setBookings] = useState<BookingStats[]>([]);

    useEffect(() => {

        if (id) {
            loadBookings(id);
        }

    }, [id]);

    async function loadBookings(serviceId: string) {

        const data =
            await BookingStatsService.getBookingsByService(serviceId);

        setBookings(data);

    }

    const totalRevenue = useMemo(() => {

        return bookings.reduce(
            (sum, booking) => sum + booking.amount,
            0
        );

    }, [bookings]);

    return (

        <section className="service-bookings">

            <div className="page-header">

                <div>

                    <h2>

                        Service Bookings

                    </h2>

                    <p>

                        Bookings for this service.

                    </p>

                </div>

                <div className="summary-card">

                    <span>Total Bookings</span>

                    <strong>{bookings.length}</strong>

                    <span>

                        Revenue ₹{totalRevenue.toLocaleString()}

                    </span>

                </div>

            </div>

            <BookingTableStats
                bookings={bookings}
            />

        </section>

    );

}