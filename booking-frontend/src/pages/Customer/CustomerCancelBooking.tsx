import Loader from "../../components/common/Loader";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getCancellationPreview, cancelBooking } from "../../services/BookingService";

import type { CancellationPreview } from "../../types/CancellationPreview";

import "./CustomerCancelBooking.css";

export default function CustomerCancelBooking() {

    const { bookingId } = useParams();

    const navigate = useNavigate();

    const [preview, setPreview] =
        useState<CancellationPreview>();

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    useEffect(() => {

        if (bookingId) {

            loadPreview();

        }

    }, [bookingId]);

    async function loadPreview() {

        try {

            const response =

                await getCancellationPreview(

                    bookingId!

                );

            setPreview(response);

        }

        catch {

            toast.error(

                "Unable to load cancellation preview."

            );

        }

        finally {

            setLoading(false);

        }

    }

    async function confirmCancellation() {

        if (!bookingId) return;

        try {

            setSubmitting(true);

            await cancelBooking(

                bookingId

            );

            navigate(

                "/customer/bookings/cancelled",

                {

                    state: {

                        refundableAmount:

                            preview.refundableAmount,

                        processingDays:

                            preview.processingDays

                    }

                }

            );

        }

        catch {

            toast.error(

                "Cancellation failed."

            );

        }

        finally {

            setSubmitting(false);

        }

    }

    if (loading) {

        return <Loader />;

    }

    if (!preview) {

        return <h2>Unable to load booking.</h2>;

    }

    return (

        <section className="cancel-page">

            <div className="cancel-card">

                <h1>

                    Cancel Booking

                </h1>

                <div className="cancel-section">

                    <h3>Booking</h3>

                    <p>

                        Booking No

                        <strong>

                            {preview.bookingNumber}

                        </strong>

                    </p>

                    <p>

                        Event Date

                        <strong>

                            {preview.eventDate}

                        </strong>

                    </p>

                </div>

                <div className="cancel-section">

                    <h3>

                        Refund Summary

                    </h3>

                    <div className="summary-row">

                        <span>

                            Paid Amount

                        </span>

                        <strong>

                            ₹

                            {preview.paidAmount.toLocaleString()}

                        </strong>

                    </div>

                    <div className="summary-row">

                        <span>

                            Refund %

                        </span>

                        <strong>

                            {preview.refundPercentage}%

                        </strong>

                    </div>

                    <div className="summary-row">

                        <span>

                            Cancellation Charge

                        </span>

                        <strong>

                            ₹

                            {preview.cancellationCharge.toLocaleString()}

                        </strong>

                    </div>

                    <div className="summary-row total">

                        <span>

                            Refund Amount

                        </span>

                        <strong>

                            ₹

                            {preview.refundableAmount.toLocaleString()}

                        </strong>

                    </div>

                </div>

                <div className="cancel-note">

                    Refund will be processed within

                    <strong>

                        {" "}

                        {preview.processingDays}

                        {" "}business days.

                    </strong>

                </div>

                <div className="cancel-actions">

                    <button

                        className="secondary"

                        onClick={() => navigate(-1)}

                    >

                        Back

                    </button>

                    <button

                        className="danger"

                        disabled={submitting}

                        onClick={confirmCancellation}

                    >

                        {

                            submitting

                                ? "Cancelling..."

                                : "Confirm Cancellation"

                        }

                    </button>

                </div>

            </div>

        </section>

    );

}
