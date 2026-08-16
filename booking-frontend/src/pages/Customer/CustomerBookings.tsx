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

    const groupedBookings = bookings.reduce(
        (
            groups: Record<string, Booking[]>,
            booking
        ) => {

            const groupId =
                booking.bookingGroupId ||
                booking.id;

            if (!groups[groupId]) {
                groups[groupId] = [];
            }

            groups[groupId].push(booking);

            return groups;

        },
        {}
    );

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
                    Object.entries(
                        bookings.reduce(
                            (
                                groups: Record<string, Booking[]>,
                                booking
                            ) => {

                                const groupId =
                                    booking.bookingGroupId ||
                                    booking.id;


                                if (!groups[groupId]) {

                                    groups[groupId] = [];

                                }


                                groups[groupId].push(
                                    booking
                                );


                                return groups;

                            },
                            {}
                        )
                    ).map(
                        (
                            [
                                groupId,
                                groupBookings
                            ]
                        ) => (

                            <BookingCard
                                key={groupId}

                                bookingGroupId={
                                    groupId
                                }

                                bookings={
                                    groupBookings
                                }

                            />

                        )
                    )
                }



        </div>

    );

};

export default CustomerBookings;