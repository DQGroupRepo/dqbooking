import "./CustomerInfo.css";

import type { BookingResponse } from "../../types/Booking";

type Props = {
    booking: BookingResponse;
};

const CustomerInfo = ({ booking }: Props) => {

    return (

        <div className="customer-card">

            <h3>Customer Details</h3>

            <div className="customer-grid">

                <div>

                    <label>Name</label>
                    <p>{booking.customerName}</p>

                </div>

                <div>

                    <label>Email</label>
                    <p>{booking.customerEmail}</p>

                </div>

                <div>

                    <label>Phone</label>
                    <p>{booking.customerPhone}</p>

                </div>

            </div>

        </div>

    );

};

export default CustomerInfo;