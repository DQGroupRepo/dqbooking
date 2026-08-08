import type { CustomerBookingDetailsResponse } from "../../types/CustomerBookingDetailsResponse";
import { formatCurrency } from "../../util/CurrencyUtil";

interface Props {

    booking: CustomerBookingDetailsResponse;

}

export default function BookingPaymentCard({

    booking

}: Props) {

    return (

        <div className="booking-details-card">

            <h2>

                Payment Summary

            </h2>

            <div className="booking-summary-grid">

                <div>

                    <span>Base Amount</span>

                    <strong>

                        ₹{booking.baseAmount}

                    </strong>

                </div>

                <div>

                    <span>Subtotal</span>

                    <strong>

                        ₹{booking.subtotal}

                    </strong>

                </div>

                <div>

                    <span>Discount</span>

                    <strong>

                        ₹{booking.discountAmount}

                    </strong>

                </div>

                <div>

                    <span>Total Amount</span>

                    <strong>

                        {formatCurrency(booking.totalAmount)}

                    </strong>

                </div>

                <div>

                    <span>Advance Amount</span>

                    <strong>

                        ₹{booking.advanceAmount}

                    </strong>

                </div>

                <div>

                    <span>Balance Amount</span>

                    <strong>

                        ₹{booking.balanceAmount}

                    </strong>

                </div>

                <div>

                    <span>Paid Amount</span>

                    <strong>

                        ₹{booking.paidAmount}

                    </strong>

                </div>

            </div>

        </div>

    );

}