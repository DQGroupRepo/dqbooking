import type { CustomerBookingDetailsResponse }
from "../../types/CustomerBookingDetailsResponse";

interface Props {

    booking: CustomerBookingDetailsResponse;

}

export default function BookingVendorCard({

    booking

}: Props) {

    return (

        <div className="booking-details-card">

            <h2>

                Vendor Information

            </h2>

            <div className="booking-summary-grid">

                <div>

                    <span>Vendor</span>

                    <strong>

                        {booking.vendorName}

                    </strong>

                </div>

                <div>

                    <span>Phone</span>

                    <strong>

                        {booking.vendorPhone}

                    </strong>

                </div>

                <div>

                    <span>Email</span>

                    <strong>

                        {booking.vendorEmail}

                    </strong>

                </div>

                <div>

                    <span>Service</span>

                    <strong>

                        {booking.serviceName}

                    </strong>

                </div>

            </div>

        </div>

    );

}