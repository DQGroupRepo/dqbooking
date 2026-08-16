import { useNavigate } from "react-router-dom";

import BookingStatusBadge from "./BookingStatusBadge";

import type { Booking } from "../../types/Booking";

import "./CustomerBookingCard.css";


interface Props {

    bookingGroupId: string;
    bookings: Booking[];
}


const BookingCard = ({
    bookingGroupId,
    bookings
}: Props) => {

    const navigate =
        useNavigate();


    /*
     * =========================================
     * FIRST BOOKING
     * =========================================
     *
     * Used for common information such as:
     *
     * - image
     * - status
     * - vendor/service information
     *
     */

    const firstBooking =
        bookings[0];


    if (!firstBooking) {

        return null;

    }


    /*
     * =========================================
     * GROUP TOTAL
     * =========================================
     */

    const groupTotal =
        bookings.reduce(
            (
                total,
                booking
            ) =>
                total +
                Number(
                    booking.totalAmount || 0
                ),
            0
        );


    /*
     * =========================================
     * GROUP STATUS
     * =========================================
     *
     * We use the first booking status for the
     * group badge.
     */

    const groupStatus =
        firstBooking.status;


    /*
     * =========================================
     * CANCELLATION
     * =========================================
     *
     * A group can contain multiple independent
     * bookings.
     *
     * Therefore cancellation remains per
     * individual booking.
     */

    const cancellableBooking =
        bookings.find(
            booking =>
                booking.cancellable
        );


    return (

        <div className="customer-booking-card">


            {/* =========================================
                LEFT
               ========================================= */}

            <div className="customer-booking-card-left">

                <img

                    src={
                        firstBooking.serviceImage ??
                        "/images/no-image.png"
                    }

                    alt={
                        firstBooking.serviceName
                    }

                />

            </div>


            {/* =========================================
                CENTER
               ========================================= */}

            <div className="customer-booking-card-center">


                <h3>
                    Booking Group
                </h3>


                <p>

                    Booking Group :
                    <strong>
                        {" "}
                        {bookingGroupId}
                    </strong>

                </p>


                {/* =========================================
                    SERVICES
                   ========================================= */}

                <div className="customer-booking-services">

                    {
                        bookings.map(
                            booking => (

                                <div
                                    key={
                                        booking.bookingGroupId
                                    }
                                    className="customer-booking-service"
                                >

                                    <h4>
                                        {
                                            booking.serviceName
                                        }
                                    </h4>


                                    <p>

                                        Booking No :
                                        <strong>
                                            {" "}
                                            {
                                                booking.bookingNumber
                                            }
                                        </strong>

                                    </p>


                                    <p>

                                        Event :
                                        {" "}
                                        {
                                            booking.eventDate
                                        }

                                    </p>


                                    <p>

                                        Guests :
                                        {" "}
                                        {
                                            booking.guestCount
                                        }

                                    </p>


                                    <p>

                                        Amount :
                                        {" "}
                                        ₹
                                        {
                                            Number(
                                                booking.totalAmount
                                            ).toLocaleString(
                                                "en-IN"
                                            )
                                        }

                                    </p>

                                </div>

                            )
                        )
                    }

                </div>


                {/* =========================================
                    GROUP TOTAL
                   ========================================= */}

                <p className="customer-booking-group-total">

                    <strong>
                        Group Total :
                    </strong>

                    {" "}

                    ₹
                    {
                        groupTotal.toLocaleString(
                            "en-IN"
                        )
                    }

                </p>

            </div>


            {/* =========================================
                RIGHT
               ========================================= */}

            <div className="customer-booking-card-right">


                <BookingStatusBadge
                    status={
                        groupStatus
                    }
                />


                {/* =========================================
                    VIEW GROUP
                   ========================================= */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/booking-confirmation/${bookingGroupId}`
                        )
                    }
                >
                    View Details
                </button>


                {/* =========================================
                    CANCEL
                   =========================================

                   Keep cancellation at individual
                   booking level.
                */}

                {
                    cancellableBooking && (

                        <button
                            type="button"
                            className="cancel"
                            onClick={() =>
                                navigate(
                                    `/customer/bookings/${cancellableBooking.bookingGroupId}/cancel`
                                )
                            }
                        >
                            Cancel Booking
                        </button>

                    )
                }

            </div>

        </div>

    );

};


export default BookingCard;