import { useNavigate } from "react-router-dom";

import BookingStatusBadge from "./BookingStatusBadge";

import type { Booking } from "../../types/Booking";

import "./CustomerBookingCard.css";

interface Props {

    booking: Booking;

}

const BookingCard = ({ booking }: Props) => {

    const navigate = useNavigate();

    return (

        <div className="customer-booking-card">

            <div className="customer-booking-card-left">

                <img

                    src={
                        booking.serviceImage ??
                        "/images/no-image.png"
                    }

                    alt={booking.serviceName}

                />

            </div>

            <div className="customer-booking-card-center">

                <h3>

                    {booking.serviceName}

                </h3>

                <p>

                    Booking No :
                    <strong>
                        {" "}
                        {booking.bookingNumber}
                    </strong>

                </p>

                <p>

                    Event :
                    {" "}
                    {booking.eventDate}

                </p>

                <p>

                    Guests :
                    {" "}
                    {booking.guestCount}

                </p>

                <p>

                    Total :
                    {" "}
                    ₹{booking.totalAmount.toLocaleString()}

                </p>

            </div>

            <div className="customer-booking-card-right">

                <BookingStatusBadge
                    status={booking.status}
                />

                <button

                    onClick={() =>
                        navigate(
                            `/customer/bookings/${booking.id}`
                        )
                    }

                >

                    View Details

                </button>

                {
                    booking.cancellable && (

                        <button

                            className="cancel"

                            onClick={() =>

                                navigate(

                                    `/customer/bookings/${booking.id}/cancel`

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