import type { Booking } from "../../../types/Booking";

interface Props {

    bookings: Booking[];

}


const BookingSummary = ({
    bookings
}: Props) => {

    return (

        <div className="booking-summary">

            <h2>
                Services Booked
            </h2>


            {
                bookings.map(
                    booking => (

                        <div
                            className="booking-service-summary"
                            key={booking.id}
                        >

                            <h3>
                                {booking.serviceName}
                            </h3>


                            <p>
                                Booking Number:{" "}
                                {booking.bookingNumber}
                            </p>


                            <p>
                                Event Date:{" "}
                                {booking.bookingFrom ? new Date(booking.bookingFrom).toLocaleDateString("en-IN") : "-"}
                            </p>


                            <p>
                                Guests:{" "}
                                {booking.guestCount}
                            </p>


                            <p>
                                Amount: ₹
                                {
                                    Number(
                                        booking.totalAmount
                                    ).toLocaleString(
                                        "en-IN"
                                    )
                                }
                            </p>


                            <p>
                                Status:{" "}
                                {booking.status}
                            </p>

                        </div>

                    )
                )
            }

        </div>

    );

};


export default BookingSummary;