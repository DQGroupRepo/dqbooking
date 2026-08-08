import type { CustomerBookingDetailsResponse } from "../../types/CustomerBookingDetailsResponse";

import { formatCurrency } from "../../util/CurrencyUtil";

interface Props {

    booking: CustomerBookingDetailsResponse;

}

export default function BookingRefundCard({

    booking

}: Props) {

    if (booking.bookingStatus !== "CANCELLED") {

        return null;

    }

    return (

        <div className="booking-details-card refund-card">

            <h2>

                Refund Information

            </h2>

            <div className="booking-summary-grid">

                <div>

                    <span>Cancelled On</span>

                    <strong>

                        {booking.cancelledAt ?? "-"}

                    </strong>

                </div>

                <div>

                    <span>Refund Percentage</span>

                    <strong>

                        {booking.refundPercentage}%

                    </strong>

                </div>

                <div>

                    <span>Cancellation Charge</span>

                    <strong>

                        {formatCurrency(

                            booking.cancellationCharge

                        )}

                    </strong>

                </div>

                <div>

                    <span>Refundable Amount</span>

                    <strong className="refund-amount">

                        {

                            formatCurrency(

                                booking.refundableAmount

                            )

                        }

                    </strong>

                </div>

                <div>

                    <span>Refund Status</span>

                    <strong>

                        {booking.paymentStatus}

                    </strong>

                </div>

            </div>

        </div>

    );

}