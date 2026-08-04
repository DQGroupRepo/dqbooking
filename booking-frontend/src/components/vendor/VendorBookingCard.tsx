import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { VendorDetail } from "../../types/VendorDetail";

import "./VendorBookingCard.css";

interface Props {

    vendor: VendorDetail;

    serviceId?: string;

}

const BookingCard = ({
vendor,
serviceId
}: Props) => {


const navigate =
    useNavigate();

const [eventDate, setEventDate] =
    useState("");

const [guests, setGuests] =
    useState<number | string>("");

const handleBooking = () => {

    if (!eventDate) {

        alert(
            "Please select an event date."
        );

        return;

    }

    if (!guests || Number(guests) < 1) {

        alert(
            "Please enter a valid guest count."
        );

        return;

    }

    navigate(
        "/checkout",
        {
            state: {

                vendor,

                serviceId,

                eventDate,

                guests

            }

        }
    );

};

return (

    <aside className="vendor-booking-card">

        <h2>
            ₹
            {Number(
                vendor.startingPrice
            ).toLocaleString("en-IN")}
        </h2>

        <p>
            Starting Price
        </p>

        <label>
            Event Date
        </label>

        <input
            type="date"
            value={eventDate}
            onChange={(e) =>
                setEventDate(
                    e.target.value
                )
            }
        />

        <label>
            Guests
        </label>

        <input
            type="number"
            min="1"
            value={guests}
            onChange={(e) =>
                setGuests(
                    e.target.value
                )
            }
            placeholder="Enter number of guests"
        />

        <button
            className="book-button"
            type="button"
            onClick={handleBooking}
        >
            Check Availability
        </button>

        <button
            className="save-button"
            type="button"
        >
            ♡ Save Vendor
        </button>

    </aside>

);


};

export default BookingCard;
