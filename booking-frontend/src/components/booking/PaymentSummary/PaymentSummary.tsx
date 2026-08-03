import "./PaymentSummary.css";

interface Props {

    total: number;

    advance: number;

    balance: number;

    paid: number;

}

const PaymentSummary = ({

    total,

    advance,

    balance,

    paid

}: Props) => {

    return (

        <div className="payment-card">

            <h3>

                Payment Summary

            </h3>

            <div className="payment-row">

                <span>Total Amount</span>

                <strong>₹{total.toLocaleString()}</strong>

            </div>

            <div className="payment-row">

                <span>Advance Required</span>

                <strong>₹{advance.toLocaleString()}</strong>

            </div>

            <div className="payment-row">

                <span>Already Paid</span>

                <strong>

                    ₹{paid.toLocaleString()}

                </strong>

            </div>

            <div className="divider" />

            <div className="payment-row balance">

                <span>Remaining Balance</span>

                <strong>

                    ₹{balance.toLocaleString()}

                </strong>

            </div>

        </div>

    );

};

export default PaymentSummary;