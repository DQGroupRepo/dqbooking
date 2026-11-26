import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";

import "./BookingConfirmation.css";

import {
    getBookingGroupById
} from "../../services/BookingService";

import type {
    BookingGroup
} from "../../types/BookingGroup";

import BookingHeader
    from "../../components/booking/BookingHeader/BookingHeader";

import BookingSummary
    from "../../components/booking/BookingSummary/BookingSummary";

import CustomerSummary
    from "../../components/booking/CustomerSummary/CustomerSummary";


const BookingConfirmation = () => {

    const {
        bookingGroupId
    } = useParams();


    const navigate =
        useNavigate();


    const [
        bookingGroup,
        setBookingGroup
    ] =
        useState<BookingGroup>();


    const [
        loading,
        setLoading
    ] =
        useState(true);


    useEffect(() => {

        if (!bookingGroupId) {

            setLoading(false);

            return;

        }


        loadBookingGroup(
            bookingGroupId
        );

    }, [bookingGroupId]);


    async function loadBookingGroup(
        groupId: string
    ) {

        try {

            const response =
                await getBookingGroupById(
                    groupId
                );


            setBookingGroup(
                response
            );

        } catch (error) {

            console.error(
                "Failed to load booking group:",
                error
            );

            setBookingGroup(
                undefined
            );

        } finally {

            setLoading(false);

        }

    }


    if (loading) {

        return (

            <div className="booking-confirmation-page">

                Loading booking...

            </div>

        );

    }


    if (
        !bookingGroup ||
        bookingGroup.bookings.length === 0
    ) {

        return (

            <div className="booking-confirmation-page">

                Booking not found.

            </div>

        );

    }


    const firstBooking =
        bookingGroup.bookings[0];


    return (

        <section className="booking-confirmation-page">

            <div className="confirmation-card">


                <BookingHeader

                    bookingNumber={
                        bookingGroup.bookingGroupId
                    }

                    status={
                        firstBooking.status
                    }

                />


                <div className="confirmation-layout">


                    <div className="confirmation-left">


                        <BookingSummary
                            bookings={
                                bookingGroup.bookings
                            }
                        />


                        <CustomerSummary

                            name={
                                firstBooking.customerName
                            }

                            phone={
                                firstBooking.customerPhone
                            }

                            email={
                                firstBooking.customerEmail
                            }

                        />


                    </div>


                    <div className="confirmation-right">

                        <div className="booking-group-pricing">

                            <h3>
                                Booking Summary
                            </h3>

                            <div className="pricing-row">
                                <span>
                                    Original Total
                                </span>

                                <strong>
                                    ₹
                                    {Number(
                                        bookingGroup.originalTotal
                                    ).toLocaleString("en-IN")}
                                </strong>
                            </div>


                            {(bookingGroup.individualDiscount ?? (bookingGroup.bundleApplied ? 0 : bookingGroup.totalDiscount)) > 0 && (
                                <div className="pricing-row discount-row">
                                    <span>Individual Discount</span>
                                    <strong>- ₹{Number(bookingGroup.individualDiscount ?? bookingGroup.totalDiscount).toLocaleString("en-IN")}</strong>
                                </div>
                            )}
                            {(bookingGroup.bundleDiscount ?? (bookingGroup.bundleApplied ? bookingGroup.totalDiscount : 0)) > 0 && (
                                <div className="pricing-row discount-row">
                                    <span>Bundle Discount</span>
                                    <strong>- ₹{Number(bookingGroup.bundleDiscount ?? bookingGroup.totalDiscount).toLocaleString("en-IN")}</strong>
                                </div>
                            )}


                            <div className="pricing-row total">
                                <span>
                                    Final Total
                                </span>

                                <strong>
                                    ₹
                                    {Number(
                                        bookingGroup.finalTotal
                                    ).toLocaleString("en-IN")}
                                </strong>
                            </div>

                        </div>


                    </div>

                </div>


                <div className="confirmation-buttons">


                    <button
                        className="primary"
                        onClick={() =>
                            navigate(
                                "/customer/bookings"
                            )
                        }
                    >
                        My Bookings
                    </button>


                    <button
                        className="secondary"
                        onClick={() => {
                            // TODO
                            // Generate booking confirmation PDF
                        }}
                    >
                        Download PDF
                    </button>


                    <button
                        className="secondary"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        Back to Home
                    </button>


                </div>


            </div>

        </section>

    );

};


export default BookingConfirmation;