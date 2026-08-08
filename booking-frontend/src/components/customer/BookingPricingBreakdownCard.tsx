import type { CustomerBookingDetailsResponse } from "../../types/CustomerBookingDetailsResponse";

import { formatCurrency } from "../../util/CurrencyUtil";

interface Props {

    booking: CustomerBookingDetailsResponse;

}

export default function BookingPricingBreakdownCard({

    booking

}: Props) {

    return (

        <div className="booking-details-card">

            <h2>

                Pricing Breakdown

            </h2>

            <table className="pricing-table">

                <thead>

                    <tr>

                        <th>Description</th>

                        <th>Amount</th>

                    </tr>

                </thead>

                <tbody>

                    <tr>

                        <td>Base Amount</td>

                        <td>

                            {formatCurrency(
                                booking.baseAmount
                            )}

                        </td>

                    </tr>

                    {

                        booking.pricingHeads.map(head => (

                            <tr key={head.code}>

                                <td>

                                    {head.name}

                                </td>

                                <td>

                                    {formatCurrency(
                                        head.calculatedAmount
                                    )}

                                </td>

                            </tr>

                        ))

                    }

                    {

                        booking.discounts.map(discount => (

                            <tr

                                key={discount.name}

                                className="discount-row"

                            >

                                <td>

                                    {discount.name}

                                </td>

                                <td>

                                    -

                                    {

                                        formatCurrency(

                                            discount.calculatedAmount

                                        )

                                    }

                                </td>

                            </tr>

                        ))

                    }

                    <tr className="total-row">

                        <td>

                            Total

                        </td>

                        <td>

                            {

                                formatCurrency(

                                    booking.totalAmount

                                )

                            }

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    );

}