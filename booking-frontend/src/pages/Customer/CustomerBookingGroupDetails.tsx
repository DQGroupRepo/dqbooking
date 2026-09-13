import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    FaArrowLeft,
    FaCalendarAlt,
    FaChevronDown,
    FaChevronUp,
    FaHeadset,
    FaInfoCircle,
    FaMapMarkerAlt,
    FaUsers
} from "react-icons/fa";

import CustomerBookingService
    from "../../services/CustomerBookingService";

import BookingStatusBadge
    from "../../components/customer/BookingStatusBadge";

import type {
    Booking
} from "../../types/Booking";

import type {
    BookingGroup
} from "../../types/BookingGroup";

import type {
    CustomerBookingDetailsResponse
} from "../../types/CustomerBookingDetailsResponse";

import "./CustomerBookingGroupDetails.css";


const CustomerBookingGroupDetails = () => {

    const {
        bookingGroupId
    } = useParams();


    const navigate =
        useNavigate();


    const [
        bookingGroup,
        setBookingGroup
    ] = useState<BookingGroup | null>(
        null
    );


    const [
        loading,
        setLoading
    ] = useState(
        true
    );


    const [
        error,
        setError
    ] = useState<string | null>(
        null
    );


    /*
     * =========================================
     * EXPANDED BOOKING
     * =========================================
     */

    const [
        expandedBookingId,
        setExpandedBookingId
    ] = useState<string | null>(
        null
    );


    /*
     * =========================================
     * BOOKING DETAILS CACHE
     * =========================================
     */

    const [
        bookingDetails,
        setBookingDetails
    ] = useState<
        Record<
            string,
            CustomerBookingDetailsResponse
        >
    >(
        {}
    );


    /*
     * =========================================
     * LOADING DETAIL
     * =========================================
     */

    const [
        loadingDetailsId,
        setLoadingDetailsId
    ] = useState<string | null>(
        null
    );


    /*
     * =========================================
     * LOAD BOOKING GROUP
     * =========================================
     */

    useEffect(
        () => {

            if (
                !bookingGroupId
            ) {

                return;

            }


            const loadBookingGroup =
                async () => {

                    try {

                        setLoading(
                            true
                        );


                        const response =
                            await CustomerBookingService.getBookingGroup(
                                bookingGroupId
                            );


                        setBookingGroup(
                            response
                        );

                    }
                    catch (
                    error
                    ) {

                        console.error(
                            error
                        );


                        setError(
                            "Unable to load booking details."
                        );

                    }
                    finally {

                        setLoading(
                            false
                        );

                    }

                };


            loadBookingGroup();


        },
        [
            bookingGroupId
        ]
    );


    /*
     * =========================================
     * GET BOOKING ID
     * =========================================
     */

    const getBookingId = (
        booking: Booking
    ) => {

        const bookingData =
            booking as Booking & {
                bookingId?: string;
                id?: string;
            };


        return (
            bookingData.bookingId ||
            bookingData.id ||
            booking.bookingNumber
        );

    };


    /*
     * =========================================
     * FORMAT DATE
     * =========================================
     */

    const formatDate = (
        date?: string
    ) => {

        if (
            !date
        ) {

            return "-";

        }


        try {

            return new Date(
                date
            ).toLocaleDateString(
                "en-GB",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

        }
        catch {

            return date;

        }

    };


    /*
     * =========================================
     * FORMAT AMOUNT
     * =========================================
     */

    const formatAmount = (
        amount?: number
    ) => {

        return `₹${Number(
            amount || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

    };


    /*
     * =========================================
     * TOGGLE BOOKING DETAILS
     * =========================================
     */

    const handleToggleDetails =
        async (
            booking: Booking
        ) => {

            const id =
                getBookingId(
                    booking
                );


            /*
             * Collapse
             */

            if (
                expandedBookingId === id
            ) {

                setExpandedBookingId(
                    null
                );


                return;

            }


            /*
             * Expand immediately
             */

            setExpandedBookingId(
                id
            );


            /*
             * Already loaded
             */

            if (
                bookingDetails[id]
            ) {

                return;

            }


            try {

                setLoadingDetailsId(
                    id
                );


                const details =
                    await CustomerBookingService.getBooking(
                        id
                    );


                setBookingDetails(
                    previous => (
                        {
                            ...previous,

                            [id]:
                                details
                        }
                    )
                );

            }
            catch (
            error
            ) {

                console.error(
                    error
                );

            }
            finally {

                setLoadingDetailsId(
                    null
                );

            }

        };


    /*
     * =========================================
     * CANCEL BOOKING
     * =========================================
     */

    const handleCancelBooking =
        () => {

            if (
                !bookingGroup
            ) {

                return;

            }


            const cancellableBooking =
                bookingGroup.bookings.find(
                    booking =>
                        booking.cancellable === true
                );


            if (
                !cancellableBooking
            ) {

                return;

            }


            const bookingId =
                getBookingId(
                    cancellableBooking
                );


            navigate(
                `/customer/bookings/${bookingId}/cancel`
            );

        };


    /*
     * =========================================
     * LOADING
     * =========================================
     */

    if (
        loading
    ) {

        return (

            <div className="customer-booking-group-page">

                <div className="customer-booking-group-loading">

                    Loading booking details...

                </div>

            </div>

        );

    }


    /*
     * =========================================
     * ERROR
     * =========================================
     */

    if (
        error ||
        !bookingGroup
    ) {

        return (

            <div className="customer-booking-group-page">

                <div className="customer-booking-group-error">

                    {
                        error ||
                        "Booking details not found."
                    }

                </div>

            </div>

        );

    }


    /*
     * =========================================
     * CALCULATIONS
     * =========================================
     */

    const serviceCount =
        bookingGroup.bookings.length;


    const hasCancellableBooking =
        bookingGroup.bookings.some(
            booking =>
                booking.cancellable === true
        );


    const firstBooking =
        bookingGroup.bookings[0];


    const groupStatus =
        firstBooking?.status;


    return (

        <div className="customer-booking-group-page">


            {/* =========================================
                BACK
            ========================================= */}

            <button
                type="button"
                className="customer-booking-group-back"
                onClick={() =>
                    navigate(
                        "/customer/bookings"
                    )
                }
            >

                <FaArrowLeft />

                Back to My Bookings

            </button>


            {/* =========================================
                HEADER
            ========================================= */}

            <div className="customer-booking-group-header">

                <div>

                    <h1>

                        Booking Details

                    </h1>


                    <p>

                        Booking Group #

                        {
                            bookingGroup.bookingGroupId
                        }

                    </p>

                </div>


                {
                    groupStatus && (

                        <BookingStatusBadge
                            status={
                                groupStatus
                            }
                        />

                    )
                }

            </div>


            {/* =========================================
                TOP SUMMARY CARDS
            ========================================= */}

            <div className="customer-booking-group-summary-cards">


                <div className="customer-booking-group-summary-card">

                    <div className="summary-icon">

                        <FaUsers />

                    </div>


                    <div>

                        <span>

                            Services

                        </span>


                        <strong>

                            {
                                serviceCount
                            }

                        </strong>

                    </div>

                </div>


                <div className="customer-booking-group-summary-card">

                    <div className="summary-icon">

                        ₹

                    </div>


                    <div>

                        <span>

                            Final Total

                        </span>


                        <strong>

                            {
                                formatAmount(
                                    bookingGroup.finalTotal
                                )
                            }

                        </strong>

                    </div>

                </div>


                <div className="customer-booking-group-summary-card">

                    <div className="summary-icon">

                        <FaCalendarAlt />

                    </div>


                    <div>

                        <span>

                            Event Type

                        </span>


                        <strong>

                            {
                                bookingGroup.eventType ||
                                "-"
                            }

                        </strong>

                    </div>

                </div>


            </div>


            {/* =========================================
                MAIN CONTENT
            ========================================= */}

            <div className="customer-booking-group-main">


                {/* =========================================
                    LEFT COLUMN
                ========================================= */}

                <div className="customer-booking-group-left">


                    {/* =========================================
                        BOOKED SERVICES
                    ========================================= */}

                    <section className="customer-booked-services-section">


                        <h2>

                            Booked Services

                        </h2>


                        <div className="customer-booked-services-list">


                            {
                                bookingGroup.bookings.map(
                                    booking => {

                                        const id =
                                            getBookingId(
                                                booking
                                            );


                                        const isExpanded =
                                            expandedBookingId ===
                                            id;


                                        const details =
                                            bookingDetails[
                                            id
                                            ];


                                        return (

                                            <div
                                                key={
                                                    id
                                                }
                                                className={
                                                    `customer-booked-service-card ${isExpanded
                                                        ? "expanded"
                                                        : ""
                                                    }`
                                                }
                                            >


                                                {/* =========================================
                                                    FIXED IMAGE COLUMN
                                                ========================================= */}

                                                <div className="customer-booked-service-image">

                                                    {
                                                        booking.serviceImage
                                                            ? (

                                                                <img
                                                                    src={
                                                                        booking.serviceImage
                                                                    }
                                                                    alt={
                                                                        booking.serviceName
                                                                    }
                                                                    onError={
                                                                        event => {

                                                                            event.currentTarget.style.display =
                                                                                "none";

                                                                        }
                                                                    }
                                                                />

                                                            )
                                                            : (

                                                                <div className="customer-booked-service-no-image">

                                                                    No Image

                                                                </div>

                                                            )
                                                    }

                                                </div>


                                                {/* =========================================
                                                    CONTENT
                                                ========================================= */}

                                                <div className="customer-booked-service-content">


                                                    {/* TOP */}

                                                    <div className="customer-booked-service-top">

                                                        <div>

                                                            <h3>

                                                                {
                                                                    booking.serviceName
                                                                }

                                                            </h3>


                                                            <div className="customer-booked-service-meta">

                                                                <span>

                                                                    <FaCalendarAlt />

                                                                    {
                                                                        formatDate(
                                                                            booking.eventDate
                                                                        )
                                                                    }

                                                                </span>


                                                                <span>

                                                                    <FaUsers />

                                                                    {
                                                                        booking.guestCount ||
                                                                        0
                                                                    }

                                                                    {" "}

                                                                    Guests

                                                                </span>


                                                                {
                                                                    booking.venue && (

                                                                        <span>

                                                                            <FaMapMarkerAlt />

                                                                            {
                                                                                booking.venue
                                                                            }

                                                                        </span>

                                                                    )
                                                                }

                                                            </div>

                                                        </div>


                                                        <BookingStatusBadge
                                                            status={
                                                                booking.status
                                                            }
                                                        />

                                                    </div>


                                                    {/* DIVIDER */}

                                                    <div className="customer-booked-service-divider" />


                                                    {/* BOOKING NUMBER */}

                                                    <div className="customer-booked-service-bottom">

                                                        <div className="customer-booked-service-basic-details">

                                                            <div>

                                                                <span>

                                                                    Booking Number

                                                                </span>


                                                                <strong>

                                                                    {
                                                                        booking.bookingNumber
                                                                    }

                                                                </strong>

                                                            </div>


                                                            <div>

                                                                <span>

                                                                    Amount

                                                                </span>


                                                                <strong>

                                                                    {
                                                                        formatAmount(
                                                                            booking.totalAmount
                                                                        )
                                                                    }

                                                                </strong>

                                                            </div>

                                                        </div>


                                                        <button
                                                            type="button"
                                                            className="customer-booked-service-toggle"
                                                            onClick={() =>
                                                                handleToggleDetails(
                                                                    booking
                                                                )
                                                            }
                                                        >

                                                            {
                                                                isExpanded
                                                                    ? (
                                                                        <>
                                                                            Hide Details

                                                                            <FaChevronUp />

                                                                        </>
                                                                    )
                                                                    : (
                                                                        <>
                                                                            View Details

                                                                            <FaChevronDown />

                                                                        </>
                                                                    )
                                                            }

                                                        </button>

                                                    </div>


                                                    {/* =========================================
                                                        EXPANDED DETAILS
                                                    ========================================= */}

                                                    {
                                                        isExpanded && (

                                                            <div className="customer-booked-service-expanded">


                                                                {
                                                                    loadingDetailsId ===
                                                                        id
                                                                        ? (

                                                                            <div className="customer-booked-service-details-loading">

                                                                                Loading booking details...

                                                                            </div>

                                                                        )
                                                                        : (

                                                                            <>


                                                                                {/* BOOKING INFORMATION */}

                                                                                <h4>

                                                                                    Booking Information

                                                                                </h4>


                                                                                <div className="customer-expanded-grid">

                                                                                    <div className="customer-expanded-field">

                                                                                        <span>

                                                                                            Booking Number

                                                                                        </span>


                                                                                        <strong>

                                                                                            {
                                                                                                details?.bookingNumber ||
                                                                                                booking.bookingNumber
                                                                                            }

                                                                                        </strong>

                                                                                    </div>


                                                                                    <div className="customer-expanded-field">

                                                                                        <span>

                                                                                            Payment Status

                                                                                        </span>


                                                                                        <strong>

                                                                                            {
                                                                                                details?.paymentStatus ||
                                                                                                "-"
                                                                                            }

                                                                                        </strong>

                                                                                    </div>


                                                                                    <div className="customer-expanded-field">

                                                                                        <span>

                                                                                            Event Date

                                                                                        </span>


                                                                                        <strong>

                                                                                            {
                                                                                                formatDate(
                                                                                                    details?.eventDate ||
                                                                                                    booking.eventDate
                                                                                                )
                                                                                            }

                                                                                        </strong>

                                                                                    </div>


                                                                                    <div className="customer-expanded-field">

                                                                                        <span>

                                                                                            Guest Count

                                                                                        </span>


                                                                                        <strong>

                                                                                            {
                                                                                                details?.guestCount ||
                                                                                                booking.guestCount ||
                                                                                                0
                                                                                            }

                                                                                        </strong>

                                                                                    </div>

                                                                                </div>


                                                                                {/* VENDOR INFORMATION */}

                                                                                <h4>

                                                                                    Vendor Information

                                                                                </h4>


                                                                                <div className="customer-expanded-grid">

                                                                                    <div className="customer-expanded-field">

                                                                                        <span>

                                                                                            Vendor

                                                                                        </span>


                                                                                        <strong>

                                                                                            {
                                                                                                details?.vendorName ||
                                                                                                "-"
                                                                                            }

                                                                                        </strong>

                                                                                    </div>


                                                                                    <div className="customer-expanded-field">

                                                                                        <span>

                                                                                            Phone

                                                                                        </span>


                                                                                        <strong>

                                                                                            {
                                                                                                details?.vendorPhone ||
                                                                                                "-"
                                                                                            }

                                                                                        </strong>

                                                                                    </div>


                                                                                    <div className="customer-expanded-field">

                                                                                        <span>

                                                                                            Email

                                                                                        </span>


                                                                                        <strong>

                                                                                            {
                                                                                                details?.vendorEmail ||
                                                                                                "-"
                                                                                            }

                                                                                        </strong>

                                                                                    </div>

                                                                                </div>


                                                                                {/* PAYMENT DETAILS */}

                                                                                <h4>

                                                                                    Payment Details

                                                                                </h4>


                                                                                <div className="customer-expanded-grid">

                                                                                    <div className="customer-expanded-field">

                                                                                        <span>

                                                                                            Total Amount

                                                                                        </span>


                                                                                        <strong>

                                                                                            {
                                                                                                formatAmount(
                                                                                                    details?.totalAmount ||
                                                                                                    booking.totalAmount
                                                                                                )
                                                                                            }

                                                                                        </strong>

                                                                                    </div>


                                                                                    <div className="customer-expanded-field">

                                                                                        <span>

                                                                                            Amount Paid

                                                                                        </span>


                                                                                        <strong>

                                                                                            {
                                                                                                formatAmount(
                                                                                                    details?.paidAmount
                                                                                                )
                                                                                            }

                                                                                        </strong>

                                                                                    </div>


                                                                                    <div className="customer-expanded-field">

                                                                                        <span>

                                                                                            Balance Amount

                                                                                        </span>


                                                                                        <strong>

                                                                                            {
                                                                                                formatAmount(
                                                                                                    details?.balanceAmount
                                                                                                )
                                                                                            }

                                                                                        </strong>

                                                                                    </div>

                                                                                </div>


                                                                            </>

                                                                        )
                                                                }

                                                            </div>

                                                        )
                                                    }


                                                </div>

                                            </div>

                                        );

                                    }
                                )
                            }

                        </div>


                    </section>


                    {/* =========================================
                        EVENT INFORMATION
                    ========================================= */}

                    <section className="customer-event-information-section">

                        <h2>

                            Event Information

                        </h2>


                        <div className="customer-event-information-grid">


                            <div className="customer-event-information-field">

                                <span>

                                    Event Type

                                </span>


                                <strong>

                                    {
                                        bookingGroup.eventType ||
                                        "-"
                                    }

                                </strong>

                            </div>


                            <div className="customer-event-information-field">

                                <span>

                                    Special Request

                                </span>


                                <strong>

                                    {
                                        bookingGroup.specialRequest ||
                                        "No special request"
                                    }

                                </strong>

                            </div>


                        </div>

                    </section>


                </div>


                {/* =========================================
                    RIGHT COLUMN
                ========================================= */}

                <div className="customer-booking-group-right">


                    {/* PAYMENT SUMMARY */}

                    <section className="customer-payment-summary-card">

                        <h2>

                            Payment Summary

                        </h2>


                        <div className="customer-payment-summary-row">

                            <span>

                                Original Total

                            </span>


                            <strong>

                                {
                                    formatAmount(
                                        bookingGroup.originalTotal
                                    )
                                }

                            </strong>

                        </div>


                        <div className="customer-payment-summary-row discount">

                            <span>

                                Discount

                            </span>


                            <strong>

                                -
                                {
                                    formatAmount(
                                        bookingGroup.totalDiscount
                                    )
                                }

                            </strong>

                        </div>


                        <div className="customer-payment-summary-row total">

                            <span>

                                Final Total

                            </span>


                            <strong>

                                {
                                    formatAmount(
                                        bookingGroup.finalTotal
                                    )
                                }

                            </strong>

                        </div>

                    </section>


                    {/* BUNDLE */}

                    {
                        bookingGroup.bundleApplied && (

                            <section className="customer-bundle-summary-card">

                                <h2>

                                    Bundle Applied

                                </h2>


                                <p>

                                    This booking contains

                                    {" "}

                                    <strong>

                                        {
                                            bookingGroup.qualifyingServiceCount
                                        }

                                    </strong>

                                    {" "}

                                    qualifying services.

                                </p>


                                <div className="customer-bundle-saving">

                                    <span>

                                        Total Bundle Savings

                                    </span>


                                    <strong>

                                        {
                                            formatAmount(
                                                bookingGroup.totalDiscount
                                            )
                                        }

                                    </strong>

                                </div>

                            </section>

                        )
                    }


                    {/* =========================================
                        CANCELLATION POLICY
                    ========================================= */}

                    <section className="customer-cancellation-policy-card">


                        <div className="customer-cancellation-policy-title">

                            <FaInfoCircle />

                            <h2>

                                Cancellation Policy

                            </h2>

                        </div>


                        <ul>

                            <li>

                                Free cancellation up to 7 days before event date.

                            </li>


                            <li>

                                50% refund for cancellations between 3–7 days.

                            </li>


                            <li>

                                No refund for cancellations within 3 days.

                            </li>

                        </ul>


                        <button
                            type="button"
                            className="customer-cancellation-policy-link"
                        >

                            View full cancellation policy →

                        </button>

                    </section>


                    {/* CANCEL BOOKING */}

                    {
                        hasCancellableBooking && (

                            <button
                                type="button"
                                className="customer-group-cancel-button"
                                onClick={
                                    handleCancelBooking
                                }
                            >

                                Cancel Booking

                            </button>

                        )
                    }


                </div>


            </div>


            {/* =========================================
                NEED SUPPORT
            ========================================= */}

            <section className="customer-support-banner">


                <div className="customer-support-icon">

                    <FaHeadset />

                </div>


                <div className="customer-support-content">

                    <h3>

                        Need Help?

                    </h3>


                    <p>

                        If you have any questions about this booking,
                        feel free to contact our support team.

                    </p>

                </div>


                <button
                    type="button"
                    className="customer-support-button"
                >

                    Contact Support

                </button>


            </section>


        </div>

    );

};


export default CustomerBookingGroupDetails;