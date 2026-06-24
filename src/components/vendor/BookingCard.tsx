import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Vendor } from "../../types/Vendor";

import "./BookingCard.css";


interface Props {
  vendor: Vendor;
}


const BookingCard = ({ vendor }: Props) => {


  const navigate = useNavigate();


  const [eventDate, setEventDate] = useState("");

  const [guests, setGuests] = useState("100-300");



  const handleBooking = () => {


    navigate("/checkout", {

      state: {

        vendor,
        eventDate,
        guests

      }

    });


  };



  return (

    <aside className="booking-card">


      <h2>
        ₹{vendor.startingPrice.toLocaleString("en-IN")}
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

        onChange={(e)=>
          setEventDate(e.target.value)
        }

      />



      <label>
        Guests
      </label>


      <select

        value={guests}

        onChange={(e)=>
          setGuests(e.target.value)
        }

      >

        <option>
          100-300
        </option>

        <option>
          300-500
        </option>

        <option>
          500+
        </option>


      </select>




      <button

        className="book-button"

        onClick={handleBooking}

      >

        Check Availability

      </button>



      <button

        className="save-button"

      >

        ♡ Save Vendor

      </button>



    </aside>

  );

};


export default BookingCard;