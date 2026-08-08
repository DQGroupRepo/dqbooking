import type { CustomerBookingDetailsResponse }
from "../../types/CustomerBookingDetailsResponse";

interface Props {

    booking: CustomerBookingDetailsResponse;

}

export default function BookingSummaryCard({

    booking

}: Props) {

    return (

        <div className="booking-details-card">

            <h2>

                Booking Summary

            </h2>

            <div className="booking-summary-grid">

                <div>

                    <span>Booking Number</span>

                    <strong>

                        {booking.bookingNumber}

                    </strong>

                </div>

                <div>

                    <span>Status</span>

                    <strong>

                        {booking.bookingStatus}

                    </strong>

                </div>

                <div>

                    <span>Payment Status</span>

                    <strong>

                        {booking.paymentStatus}

                    </strong>

                </div>

                <div>

                    <span>Booking Date</span>

                    <strong>

                        {booking.bookingDate}

                    </strong>

                </div>

                <div>

                    <span>Event Date</span>

                    <strong>

                        {booking.eventDate}

                    </strong>

                </div>

                <div>

                    <span>Guests</span>

                    <strong>

                        {booking.guestCount}

                    </strong>

                </div>

                <div>

                    <span>Event Type</span>

                    <strong>

                        {booking.eventType}

                    </strong>

                </div>

            </div>

        </div>

    );

}