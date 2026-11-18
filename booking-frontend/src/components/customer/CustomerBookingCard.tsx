import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaUsers
} from "react-icons/fa";

import BookingStatusBadge from "./BookingStatusBadge";

import type {
    Booking
} from "../../types/Booking";

import "./CustomerBookingCard.css";


interface Props {

    bookingGroupId: string;

    bookings: Booking[];

}


const BookingCard = ({
    bookingGroupId,
    bookings
}: Props) => {

    const navigate =
        useNavigate();


    /*
     * =========================================
     * IMAGE ERROR STATE
     * =========================================
     */

    const [
        imageError,
        setImageError
    ] =
        useState(false);


    /*
     * =========================================
     * SAFETY CHECK
     * =========================================
     */

    if (
        !bookings ||
        bookings.length === 0
    ) {

        return null;

    }


    /*
     * =========================================
     * FIRST BOOKING
     * =========================================
     */

    const firstBooking =
        bookings[0];


    /*
     * =========================================
     * GROUP TOTAL
     * =========================================
     */

    const groupTotal =
        bookings.reduce(
            (
                total,
                booking
            ) =>
                total +
                Number(
                    booking.totalAmount ||
                    0
                ),
            0
        );


    /*
     * =========================================
     * GROUP STATUS
     * =========================================
     */

    const groupStatus =
        firstBooking.status;


    /*
     * =========================================
     * CANCELLABLE BOOKING
     * =========================================
     */

    const cancellableBooking =
        bookings.find(
            booking =>
                booking.cancellable ===
                true
        );


    /*
     * =========================================
     * IMAGE
     * =========================================
     */

    const serviceImage =
        firstBooking.serviceImage;


    const hasValidImage =
        Boolean(
            serviceImage
        ) &&
        !imageError;


    /*
     * =========================================
     * ADDITIONAL SERVICES
     * =========================================
     */

    const additionalServiceCount =
        bookings.length - 1;


    return (

        <div className="customer-booking-card">


            {/* =========================================
                IMAGE
               ========================================= */}

            <div className="customer-booking-card-image">

                {
                    hasValidImage
                        ? (

                            <img
                                src={
                                    serviceImage
                                }
                                alt={
                                    firstBooking.serviceName
                                }
                                onError={() =>
                                    setImageError(
                                        true
                                    )
                                }
                            />

                        )
                        : (

                            <div
                                className="
                                    customer-booking-no-image
                                "
                            >

                                No Image Available

                            </div>

                        )
                }

            </div>


            {/* =========================================
                SERVICE INFORMATION
               ========================================= */}

            <div className="customer-booking-card-info">


                <h3>

                    {
                        firstBooking.serviceName
                    }

                </h3>


                {
                    additionalServiceCount >
                    0 && (

                        <div
                            className="
                                customer-booking-service-count
                            "
                        >

                            +
                            {
                                additionalServiceCount
                            }

                            {" "}

                            more service
                            {
                                additionalServiceCount >
                                1
                                    ? "s"
                                    : ""
                            }

                        </div>

                    )
                }


                <span
                    className="
                        customer-booking-category
                    "
                >

                    {
                        firstBooking.serviceCategory ||
                        "Booking Service"
                    }

                </span>


                <div
                    className="
                        customer-booking-meta
                    "
                >


                    <span>

                        <FaCalendarAlt />

                        {
                            firstBooking.bookingFrom.split("T")[0]
                        }

                    </span>


                    <span>

                        <FaUsers />

                        {
                            firstBooking.guestCount
                        }

                        {" "}

                        Guests

                    </span>


                    {
                        firstBooking.venue && (

                            <span>

                                <FaMapMarkerAlt />

                                {
                                    firstBooking.venue
                                }

                            </span>

                        )
                    }


                </div>


                <div
                    className="
                        customer-booking-group-id
                    "
                >

                    Group:

                    {" "}

                    {
                        bookingGroupId
                    }

                </div>


            </div>


            {/* =========================================
                BOOKING INFORMATION
               ========================================= */}

            <div
                className="
                    customer-booking-card-booking-info
                "
            >


                <div
                    className="
                        customer-booking-number
                    "
                >

                    <span>

                        Booking No

                    </span>

                    <strong>

                        {
                            firstBooking.bookingNumber
                        }

                    </strong>

                </div>


                <div
                    className="
                        customer-booking-amount
                    "
                >

                    <span>

                        Total Amount

                    </span>

                    <strong>

                        ₹
                        {
                            groupTotal
                                .toLocaleString(
                                    "en-IN"
                                )
                        }

                    </strong>

                </div>


            </div>


            {/* =========================================
                ACTIONS
               ========================================= */}

            <div
                className="
                    customer-booking-card-actions
                "
            >


                <BookingStatusBadge
                    status={
                        groupStatus
                    }
                />


                <div
                    className="
                        customer-booking-buttons
                    "
                >


                    <button
                        type="button"
                        className="
                            customer-booking-view-button
                        "
                        onClick={() =>
                            navigate(
                                `/customer/bookings/group/${bookingGroupId}`
                            )
                        }
                    >

                        View Details

                    </button>


                    {
                        cancellableBooking && (

                            <button
                                type="button"
                                className="
                                    customer-booking-cancel-button
                                "
                                onClick={() =>
                                    navigate(
                                        `/customer/bookings/group/${bookingGroupId}/cancel`
                                    )
                                }
                            >

                                Cancel Booking

                            </button>

                        )
                    }


                </div>


            </div>


        </div>

    );

};


export default BookingCard;