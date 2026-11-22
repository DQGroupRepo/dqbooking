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


                            {booking.slotName && (
                                <p>
                                    Time Slot: {booking.slotName}
                                    {(booking.slotStartTime || booking.slotEndTime) && (
                                        <> ({booking.slotStartTime ?? ""}{booking.slotEndTime ? ` - ${booking.slotEndTime}` : ""})</>
                                    )}
                                </p>
                            )}

                            {String(booking.serviceCategory ?? "").toUpperCase() === "STAY" && (
                                <>
                                    {booking.resourceTypeName && <p>Room Type: {booking.resourceTypeName}</p>}
                                    {booking.roomQuantity != null && <p>Room Quantity: {booking.roomQuantity}</p>}
                                    {!!(booking.resourceNames?.length || booking.resourceIds?.length) && (
                                        <p>
                                            Allocated Rooms: {(booking.resourceNames?.length ? booking.resourceNames : booking.resourceIds ?? []).join(", ")}
                                        </p>
                                    )}
                                </>
                            )}

                            <p>
                                Guests:{" "}
                                {booking.guestCount ?? "—"}
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