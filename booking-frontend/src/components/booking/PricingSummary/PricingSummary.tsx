import "./PricingSummary.css";

import type { BookingPricingResponse } from "../../../types/BookingPricing";

interface Props {
    pricing: BookingPricingResponse;
}

const PricingSummary = ({ pricing }: Props) => {

    if (!pricing) {
        return null;
    }

    return (

        <div className="pricing-summary">

            <h3>Pricing Summary</h3>

            {/* Base Amount */}

            <div className="pricing-row">
                <span>Base Amount</span>
                <strong>
                    ₹{pricing.baseAmount.toLocaleString()}
                </strong>
            </div>

            {/* Pricing Heads */}

            {pricing.pricingHeads.map(head => (

                <div
                    key={head.code}
                    className="pricing-row"
                >
                    <span>{head.name}</span>

                    <strong>
                        ₹{head.calculatedAmount.toLocaleString()}
                    </strong>

                </div>

            ))}

            <div className="pricing-divider" />

            {/* Subtotal */}

            <div className="pricing-row">

                <span>Subtotal</span>

                <strong>
                    ₹{pricing.subtotal.toLocaleString()}
                </strong>

            </div>

            {/* Individual Discounts */}

            {pricing.discounts.map(discount => (

                <div
                    key={discount.name}
                    className="pricing-row discount"
                >

                    <span>{discount.name}</span>

                    <strong className="discount-text">

                        - ₹{discount.calculatedAmount.toLocaleString()}

                    </strong>

                </div>

            ))}

            {/* Total Discount */}

            {pricing.discountAmount > 0 && (

                <>
                    <div className="pricing-divider" />

                    <div className="pricing-row">

                        <span>Total Discount</span>

                        <strong className="discount-text">

                            - ₹{pricing.discountAmount.toLocaleString()}

                        </strong>

                    </div>

                </>

            )}

            <div className="pricing-divider" />

            {/* Grand Total */}

            <div className="pricing-row total">

                <span>Grand Total</span>

                <strong>

                    ₹{pricing.totalAmount.toLocaleString()}

                </strong>

            </div>

            {/* Payment Section */}

            <div className="pricing-divider" />

            <h4 className="payment-heading">
                Payment Summary
            </h4>

            <div className="pricing-row">

                <span>Advance Payable</span>

                <strong>

                    ₹{pricing.advanceAmount.toLocaleString()}

                </strong>

            </div>

            <div className="pricing-row">

                <span>Balance at Event</span>

                <strong>

                    ₹{pricing.balanceAmount.toLocaleString()}

                </strong>

            </div>

            <div className="payment-note">

                Your booking is confirmed after the advance payment is received.

            </div>

        </div>

    );

};

export default PricingSummary;