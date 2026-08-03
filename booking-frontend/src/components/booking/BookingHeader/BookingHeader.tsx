import "./BookingHeader.css";

interface Props {
    bookingNumber: string;
    status: string;
}

const BookingHeader = ({ bookingNumber, status }: Props) => {

    return (

        <div className="booking-header">

            <div className="success-circle">
                ✓
            </div>

            <h1>
                Booking Submitted Successfully
            </h1>

            <p>
                Your booking request has been sent to the vendor.
            </p>

            <div className="booking-number">

                Booking #

                <strong>{bookingNumber}</strong>

            </div>

            <span className={`booking-status ${status.toLowerCase()}`}>

                {status}

            </span>

        </div>

    );

};

export default BookingHeader;