import { useEffect, useState } from "react";

import CustomerBookingService from "../../services/CustomerBookingService";

import type { Booking } from "../../types/Booking";
import BookingCard from "../../components/customer/CustomerBookingCard";

const CustomerBookings = () => {

    const [bookings, setBookings] =
        useState<Booking[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        loadBookings();

    }, []);

    async function loadBookings() {

        try {

            const response =
                await CustomerBookingService
                    .getBookings();

            setBookings(response);

        }

        finally {

            setLoading(false);

        }

    }

    if (loading) {

        return <div>Loading bookings...</div>;

    }

    return (

        <div style={{ padding: 30 }}>

            <h1>My Bookings</h1>

            <br/>
                {
                    bookings.map(booking => (

                        <BookingCard
                            key={booking.id}
                            booking={booking}
                        />

                    ))
                }



        </div>

    );

};

export default CustomerBookings;