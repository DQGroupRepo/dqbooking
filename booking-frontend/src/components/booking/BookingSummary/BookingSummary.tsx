import "./BookingSummary.css";

import type { Booking } from "../../types/Booking";

interface Props{

    booking:Booking;

}

const BookingSummary=({booking}:Props)=>{

    return(

        <div className="summary-card">

            <h3>Booking Details</h3>

            <div className="summary-grid">

                <div>

                    <label>Service</label>

                    <strong>{booking.serviceName}</strong>

                </div>

                <div>

                    <label>Event Date</label>

                    <strong>{booking.eventDate}</strong>

                </div>

                <div>

                    <label>Guests</label>

                    <strong>{booking.guestCount}</strong>

                </div>

                <div>

                    <label>Event Type</label>

                    <strong>{booking.eventType}</strong>

                </div>

            </div>

        </div>

    );

};

export default BookingSummary;