import { useLocation, useNavigate } from "react-router-dom";

import "./BookingCancellationSuccess.css";

export default function BookingCancellationSuccess() {

    const navigate = useNavigate();

    const { state } = useLocation();

    return (

        <section className="cancel-success-page">

            <div className="cancel-success-card">

                <div className="success-icon">

                    ✓

                </div>

                <h1>

                    Booking Cancelled Successfully

                </h1>

                <p>

                    Your cancellation request has been submitted.

                </p>

                <div className="refund-summary">

                    <div>

                        <span>

                            Refund Amount

                        </span>

                        <strong>

                            ₹

                            {state?.refundableAmount?.toLocaleString() ?? "0"}

                        </strong>

                    </div>

                    <div>

                        <span>

                            Processing Time

                        </span>

                        <strong>

                            {state?.processingDays ?? "-"}

                            {" "}Business Days

                        </strong>

                    </div>

                </div>

                <button

                    onClick={() =>

                        navigate("/customer/bookings")

                    }

                >

                    Back To My Bookings

                </button>

            </div>

        </section>

    );

}