import type { PaymentHistory } from "../../../types/Revenue";

import "./RecentPaymentsTable.css";

interface Props {

    payments: PaymentHistory[];

}

export default function RecentPaymentsTable({

    payments

}: Props) {

    return (

        <div className="payments-table">

            <table>

                <thead>

                    <tr>

                        <th>Booking</th>

                        <th>Customer</th>

                        <th>Date</th>

                        <th>Amount</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        payments.map(payment => (

                            <tr key={payment.bookingNumber}>

                                <td>

                                    {payment.bookingNumber}

                                </td>

                                <td>

                                    {payment.customerName}

                                </td>

                                <td>

                                    {payment.eventDate}

                                </td>

                                <td>

                                    ₹{payment.totalAmount.toLocaleString()}

                                </td>

                                <td>

                                    <span

                                        className={`payment-status ${payment.paymentStatus.toLowerCase()}`}

                                    >

                                        {payment.paymentStatus}

                                    </span>

                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}