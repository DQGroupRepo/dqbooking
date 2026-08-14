import { useEffect, useMemo, useState } from "react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../api/axiosConfig";
import CartService from "../../services/CartService";
import { createBooking } from "../../services/bookingService";

import type { CartItem } from "../../types/CartItem";

import "./BookingCheckout.css";


interface VendorData {

    id: string;

    businessName: string;

    city?: string;

    imageUrl?: string;

    startingPrice?: number;

}


interface BookingLocationState {

    vendor?: VendorData | null;

    serviceId?: string;

    eventDate?: string;

    guests?: number | string;

    cart?: CartItem[];

}


interface PricingHead {

    code: string;

    name: string;

    calculationType:
        | "FIXED"
        | "PERCENTAGE"
        | string;

    value: number;

    calculatedAmount: number;

    displayOrder?: number;

    active?: boolean;

}


interface Discount {

    name: string;

    discountType:
        | "FIXED"
        | "PERCENTAGE"
        | string;

    value: number;

    calculatedAmount: number;

}


interface PricingCalculationResult {

    pricingId: string;

    pricingVersion: number;

    baseAmount: number;

    pricingHeads: PricingHead[];

    subtotal: number;

    discounts: Discount[];

    discountAmount: number;

    totalAmount: number;

    advanceAmount: number;

    balanceAmount: number;

}


interface BundleBookingResponse {

    id: string;

    bookingNumber?: string;

    status?: string;

    totalAmount?: number;

}


const BookingCheckout = () => {

    const location =
        useLocation();

    const navigate =
        useNavigate();


    const state =
        location.state as
        BookingLocationState | null;


    /*
     * =========================================
     * CHECKOUT SOURCE
     * =========================================
     */

    const cart =
        state?.cart ?? [];


    const isCartCheckout =
        cart.length > 0;


    /*
     * =========================================
     * DIRECT BOOKING DATA
     * =========================================
     */

    const vendor =
        state?.vendor ?? null;


    const serviceId =
        state?.serviceId ?? "";


    const initialEventDate =
        state?.eventDate ?? "";


    const initialGuests =
        state?.guests ?? "";


    /*
     * =========================================
     * SINGLE SERVICE EVENT DATA
     * =========================================
     *
     * Cart checkout does NOT edit these values.
     * They already belong to each CartItem.
     */

    const [eventDate, setEventDate] =
        useState(
            initialEventDate
        );


    const [guests, setGuests] =
        useState<number | string>(
            initialGuests
        );


    /*
     * =========================================
     * OTHER BOOKING INFORMATION
     * =========================================
     */

    const [eventType, setEventType] =
        useState("");


    const [specialRequest, setSpecialRequest] =
        useState("");


    const [
        paymentPreference,
        setPaymentPreference
    ] = useState(
        "PAY_AFTER_CONFIRMATION"
    );


    /*
     * =========================================
     * SINGLE SERVICE PRICING
     * =========================================
     */

    const [
        pricing,
        setPricing
    ] =
        useState<PricingCalculationResult | null>(
            null
        );


    const [
        pricingLoading,
        setPricingLoading
    ] =
        useState(
            !isCartCheckout
        );


    const [
        submitting,
        setSubmitting
    ] =
        useState(false);


    const [
        error,
        setError
    ] =
        useState<string | null>(
            null
        );


    /*
     * =========================================
     * CART PRICING
     * =========================================
     *
     * IMPORTANT:
     *
     * Bundle pricing is now calculated
     * directly from CartService.
     *
     * We do NOT call /bundles/calculate
     * for displaying the checkout prices.
     */

    const cartPricing =
        useMemo(() => {

            if (!isCartCheckout) {
                return [];
            }


            return cart.map(
                item => {

                    const itemPricing =
                        CartService.getItemPricing(
                            item
                        );


                    return {

                        item,

                        ...itemPricing

                    };

                }
            );

        }, [
            cart,
            isCartCheckout
        ]);


    /*
     * =========================================
     * CART TOTALS
     * =========================================
     */

    const cartOriginalTotal =
        useMemo(() => {

            return cartPricing.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.originalPrice,
                0
            );

        }, [
            cartPricing
        ]);


    const cartBundleDiscount =
        useMemo(() => {

            return cartPricing.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.discount,
                0
            );

        }, [
            cartPricing
        ]);


    const cartFinalTotal =
        useMemo(() => {

            return cartPricing.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.finalPrice,
                0
            );

        }, [
            cartPricing
        ]);


    /*
     * =========================================
     * FORMAT CURRENCY
     * =========================================
     */

    const formatCurrency =
        (
            amount:
                number |
                null |
                undefined
        ) => {

            return `₹${(
                amount ?? 0
            ).toLocaleString(
                "en-IN"
            )}`;

        };


    /*
     * =========================================
     * GET MINIMUM DATE
     * =========================================
     */

    const getTomorrowDate =
        (): string => {

            const tomorrow =
                new Date();

            tomorrow.setDate(
                tomorrow.getDate() + 1
            );


            return tomorrow
                .toISOString()
                .split("T")[0];

        };


    /*
     * =========================================
     * LOAD SINGLE SERVICE PRICING
     * =========================================
     */

    useEffect(() => {

        if (
            isCartCheckout ||
            !serviceId ||
            !eventDate
        ) {

            if (isCartCheckout) {

                setPricingLoading(
                    false
                );

            }

            return;

        }


        const loadPricing =
            async () => {

                try {

                    setPricingLoading(
                        true
                    );

                    setError(
                        null
                    );


                    const response =
                        await api.get<PricingCalculationResult>(
                            `/pricing/services/${serviceId}/calculate`,
                            {
                                params: {
                                    eventDate
                                }
                            }
                        );


                    setPricing(
                        response.data
                    );


                } catch (err: any) {

                    console.error(
                        "Failed to load pricing:",
                        err
                    );


                    const message =
                        err?.response?.data?.message ||
                        "Unable to load current pricing for this service.";


                    setError(
                        message
                    );


                    toast.error(
                        message
                    );


                } finally {

                    setPricingLoading(
                        false
                    );

                }

            };


        loadPricing();

    }, [
        serviceId,
        eventDate,
        isCartCheckout
    ]);


    /*
     * =========================================
     * PAYMENT MESSAGE
     * =========================================
     */

    const paymentMessage =
        useMemo(() => {

            switch (
                paymentPreference
            ) {

                case "ADVANCE_PAYMENT":

                    return "Advance payment will be required according to the vendor's payment configuration.";

                case "DISCUSS_WITH_VENDOR":

                    return "You can discuss payment terms directly with the vendor.";

                default:

                    return "Payment will be handled after vendor confirmation.";

            }

        }, [
            paymentPreference
        ]);


    /*
     * =========================================
     * VALIDATION
     * =========================================
     */

    if (
        !isCartCheckout &&
        !vendor
    ) {

        return (

            <section className="checkout-section">

                <div className="container">

                    <h2>
                        Booking information not found.
                    </h2>


                    <button
                        className="cancel-button"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        Go To Home
                    </button>

                </div>

            </section>

        );

    }


    if (
        !isCartCheckout &&
        !serviceId
    ) {

        return (

            <section className="checkout-section">

                <div className="container">

                    <h2>
                        Service information is missing.
                    </h2>


                    <p>
                        Please return to the vendor page
                        and select a service again.
                    </p>


                    <button
                        className="cancel-button"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        ← Back To Vendor
                    </button>

                </div>

            </section>

        );

    }


    if (
        isCartCheckout &&
        cart.length === 0
    ) {

        return (

            <section className="checkout-section">

                <div className="container">

                    <h2>
                        Your cart is empty.
                    </h2>


                    <button
                        className="cancel-button"
                        onClick={() =>
                            navigate("/cart")
                        }
                    >
                        ← Back To Cart
                    </button>

                </div>

            </section>

        );

    }


    /*
     * =========================================
     * SUBMIT BOOKING
     * =========================================
     */

    const handleSubmit =
        async () => {

            if (submitting) {
                return;
            }


            /*
             * =========================================
             * CART BOOKING
             * =========================================
             *
             * Event date and guest count are taken
             * from the selected CartItems.
             */

            if (isCartCheckout) {

                /*
                 * Make sure every service has
                 * event details.
                 */

                const missingDate =
                    cart.some(
                        item =>
                            !item.eventDate
                    );


                if (missingDate) {

                    toast.error(
                        "One or more selected services do not have an event date."
                    );

                    return;

                }


                const invalidGuests =
                    cart.some(
                        item =>
                            !item.guestCount ||
                            Number(
                                item.guestCount
                            ) < 1
                    );


                if (invalidGuests) {

                    toast.error(
                        "One or more selected services do not have a valid guest count."
                    );

                    return;

                }


                if (!eventType.trim()) {

                    toast.error(
                        "Please enter the event type."
                    );

                    return;

                }


                try {

                    setSubmitting(
                        true
                    );


                    /*
                     * =========================================
                     * IMPORTANT
                     * =========================================
                     *
                     * The bundle booking API currently
                     * accepts one eventDate and one guestCount.
                     *
                     * Since the bundle services were selected
                     * with the same booking details, use the
                     * first cart item's values.
                     */

                    const firstItem =
                        cart[0];


                    const request = {

                        serviceIds:
                            cart.map(
                                item =>
                                    item.serviceId
                            ),

                        eventDate:
                            firstItem.eventDate,

                        guestCount:
                            Number(
                                firstItem.guestCount
                            ),

                        specialRequest:
                            specialRequest.trim(),

                        eventType:
                            eventType.trim()

                    };


                    console.log(
                        "Creating bundle booking:",
                        request
                    );


                    const response =
                        await api.post<BundleBookingResponse>(
                            "/bookings/bundle",
                            request
                        );


                    const booking =
                        response.data;


                    /*
                     * Clear cart only after
                     * successful booking.
                     */

                    CartService.clearCart();


                    toast.success(
                        booking.bookingNumber
                            ? `Booking request ${booking.bookingNumber} submitted successfully!`
                            : "Bundle booking submitted successfully!"
                    );


                    navigate(
                        `/booking-confirmation/${booking.id}`,
                        {
                            state: {
                                booking
                            }
                        }
                    );


                } catch (err: any) {

                    console.error(
                        "Bundle booking creation failed:",
                        err
                    );


                    const message =
                        err?.response?.data?.message ||
                        "Unable to submit bundle booking request. Please try again.";


                    toast.error(
                        message
                    );


                } finally {

                    setSubmitting(
                        false
                    );

                }


                return;

            }


            /*
             * =========================================
             * DIRECT SINGLE SERVICE BOOKING
             * =========================================
             */

            if (!eventDate) {

                toast.error(
                    "Please select an event date."
                );

                return;

            }


            if (
                !guests ||
                Number(guests) < 1
            ) {

                toast.error(
                    "Please enter a valid guest count."
                );

                return;

            }


            if (!eventType.trim()) {

                toast.error(
                    "Please enter the event type."
                );

                return;

            }


            try {

                setSubmitting(
                    true
                );


                const bookingRequest = {

                    serviceId,

                    eventDate,

                    guestCount:
                        Number(
                            guests
                        ),

                    specialRequest:
                        specialRequest.trim(),

                    eventType:
                        eventType.trim()

                };


                console.log(
                    "Creating booking:",
                    bookingRequest
                );


                const booking =
                    await createBooking(
                        bookingRequest
                    );


                toast.success(
                    `Booking request ${booking.bookingNumber} submitted successfully!`
                );


                navigate(
                    `/booking-confirmation/${booking.id}`,
                    {
                        state: {
                            booking
                        }
                    }
                );


            } catch (err: any) {

                console.error(
                    "Booking creation failed:",
                    err
                );


                const message =
                    err?.response?.data?.message ||
                    "Unable to submit booking request. Please try again.";


                toast.error(
                    message
                );


            } finally {

                setSubmitting(
                    false
                );

            }

        };


    /*
     * =========================================
     * SINGLE SERVICE PRICING DATA
     * =========================================
     */

    const baseAmount =
        pricing?.baseAmount ?? 0;


    const pricingHeads =
        pricing?.pricingHeads ?? [];


    const discounts =
        pricing?.discounts ?? [];


    const subtotal =
        pricing?.subtotal ?? 0;


    const discountAmount =
        pricing?.discountAmount ?? 0;


    const totalAmount =
        pricing?.totalAmount ?? 0;


    const advanceAmount =
        pricing?.advanceAmount ?? 0;


    const balanceAmount =
        pricing?.balanceAmount ?? 0;


    /*
     * =========================================
     * RENDER
     * =========================================
     */

    return (

        <section className="checkout-section">

            <div className="container">

                <h1>
                    Complete Your Booking
                </h1>


                <p className="checkout-subtitle">

                    {isCartCheckout
                        ? "Review your selected services and event details before checkout."
                        : "Review your event details and submit your booking request."
                    }

                </p>


                <div className="checkout-layout">


                    {/* =================================
                        LEFT SIDE
                    ================================= */}

                    <div className="checkout-main">


                        {/* =================================
                            SELECTED SERVICES
                        ================================= */}

                        {isCartCheckout && (

                            <div className="checkout-card">

                                <h2>
                                    Selected Services
                                </h2>


                                <p>
                                    Review your selected
                                    services and bundle
                                    pricing.
                                </p>


                                <div
                                    className="checkout-cart-items"
                                >

                                    {cartPricing.map(
                                        ({
                                            item,
                                            originalPrice,
                                            discount,
                                            finalPrice,
                                            bundleApplied
                                        }) => (

                                            <div
                                                key={
                                                    item.serviceId
                                                }
                                                className="checkout-cart-item"
                                            >

                                                {/* SERVICE DETAILS */}

                                                <div>

                                                    <strong>
                                                        {
                                                            item.serviceName
                                                        }
                                                    </strong>


                                                    <span>
                                                        {
                                                            item.vendorName
                                                        }
                                                    </span>


                                                    {item.category && (

                                                        <small>
                                                            {
                                                                item.category
                                                            }
                                                        </small>

                                                    )}


                                                    <small>
                                                        Event Date:{" "}
                                                        {
                                                            item.eventDate ||
                                                            "Not Available"
                                                        }
                                                    </small>


                                                    <small>
                                                        Guests:{" "}
                                                        {
                                                            item.guestCount ||
                                                            "Not Available"
                                                        }
                                                    </small>

                                                </div>


                                                {/* PRICE DETAILS */}

                                                <div
                                                    className="checkout-service-pricing"
                                                >

                                                    <div>

                                                        <span>
                                                            Original
                                                        </span>

                                                        <strong>
                                                            {
                                                                formatCurrency(
                                                                    originalPrice
                                                                )
                                                            }
                                                        </strong>

                                                    </div>


                                                    {bundleApplied && (

                                                        <div
                                                            className="discount-row"
                                                        >

                                                            <span>
                                                                Bundle Discount
                                                            </span>

                                                            <strong>
                                                                -
                                                                {
                                                                    formatCurrency(
                                                                        discount
                                                                    )
                                                                }
                                                            </strong>

                                                        </div>

                                                    )}


                                                    <div>

                                                        <span>
                                                            Final
                                                        </span>

                                                        <strong>
                                                            {
                                                                formatCurrency(
                                                                    finalPrice
                                                                )
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>


                                {/* =================================
                                    BUNDLE DISCOUNT MESSAGE
                                ================================= */}

                                {cartBundleDiscount > 0 && (

                                    <div
                                        className="bundle-discount-summary"
                                    >

                                        <strong>
                                            🎉 Bundle Discount Applied
                                        </strong>


                                        <span>
                                            You saved{" "}
                                            {
                                                formatCurrency(
                                                    cartBundleDiscount
                                                )
                                            }{" "}
                                            on this bundle.
                                        </span>

                                    </div>

                                )}

                            </div>

                        )}


                        {/* =================================
                            SINGLE SERVICE BOOKING SUMMARY
                        ================================= */}

                        {!isCartCheckout && vendor && (

                            <div className="checkout-card">

                                <h2>
                                    Booking Summary
                                </h2>


                                <div
                                    className="booking-summary-grid"
                                >

                                    <div
                                        className="summary-item"
                                    >

                                        <label>
                                            Vendor
                                        </label>

                                        <p>
                                            {
                                                vendor.businessName
                                            }
                                        </p>

                                    </div>


                                    <div
                                        className="summary-item"
                                    >

                                        <label>
                                            Event Date
                                        </label>

                                        <p>
                                            {
                                                eventDate ||
                                                "Not Selected"
                                            }
                                        </p>

                                    </div>


                                    <div
                                        className="summary-item"
                                    >

                                        <label>
                                            Guests
                                        </label>

                                        <p>
                                            {
                                                guests
                                            }
                                        </p>

                                    </div>


                                    <div
                                        className="summary-item"
                                    >

                                        <label>
                                            Location
                                        </label>

                                        <p>
                                            {
                                                vendor.city ||
                                                "Not Available"
                                            }
                                        </p>

                                    </div>

                                </div>


                                <button
                                    className="save-button"
                                    onClick={() =>
                                        navigate(-1)
                                    }
                                >
                                    Modify Booking
                                </button>

                            </div>

                        )}


                        {/* =================================
                            EVENT INFORMATION
                        ================================= */}

                        <div className="checkout-card">

                            <h2>
                                Event Information
                            </h2>


                            <div className="form-group">

                                <label>
                                    Event Type
                                </label>


                                <input
                                    type="text"
                                    value={
                                        eventType
                                    }
                                    onChange={(e) =>
                                        setEventType(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Wedding, Birthday, Corporate Event..."
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Special Request
                                </label>


                                <textarea
                                    rows={4}
                                    value={
                                        specialRequest
                                    }
                                    onChange={(e) =>
                                        setSpecialRequest(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Add any special requirements or instructions for the vendor..."
                                />

                            </div>

                        </div>


                        {/* =================================
                            PAYMENT PREFERENCE
                        ================================= */}

                        <div className="checkout-card">

                            <h2>
                                Payment Preference
                            </h2>


                            <label
                                className="radio-option"
                            >

                                <input
                                    type="radio"
                                    name="payment"
                                    value="ADVANCE_PAYMENT"
                                    checked={
                                        paymentPreference ===
                                        "ADVANCE_PAYMENT"
                                    }
                                    onChange={(e) =>
                                        setPaymentPreference(
                                            e.target.value
                                        )
                                    }
                                />

                                Pay Advance Now

                            </label>


                            <label
                                className="radio-option"
                            >

                                <input
                                    type="radio"
                                    name="payment"
                                    value="PAY_AFTER_CONFIRMATION"
                                    checked={
                                        paymentPreference ===
                                        "PAY_AFTER_CONFIRMATION"
                                    }
                                    onChange={(e) =>
                                        setPaymentPreference(
                                            e.target.value
                                        )
                                    }
                                />

                                Pay After Vendor Confirmation

                            </label>


                            <label
                                className="radio-option"
                            >

                                <input
                                    type="radio"
                                    name="payment"
                                    value="DISCUSS_WITH_VENDOR"
                                    checked={
                                        paymentPreference ===
                                        "DISCUSS_WITH_VENDOR"
                                    }
                                    onChange={(e) =>
                                        setPaymentPreference(
                                            e.target.value
                                        )
                                    }
                                />

                                Discuss With Vendor

                            </label>


                            <p
                                className="payment-message"
                            >
                                {
                                    paymentMessage
                                }
                            </p>

                        </div>


                    </div>


                    {/* =================================
                        RIGHT SIDE
                    ================================= */}

                    <div className="checkout-sidebar">

                        <div className="booking-summary">


                            {/* =================================
                                CART SUMMARY
                            ================================= */}

                            {isCartCheckout ? (

                                <>

                                    <h3>
                                        Order Summary
                                    </h3>


                                    <p>
                                        {
                                            cart.length
                                        }{" "}
                                        service
                                        {
                                            cart.length !== 1
                                                ? "s"
                                                : ""
                                        }
                                    </p>


                                    <hr />


                                    {cartPricing.map(
                                        ({
                                            item,
                                            originalPrice,
                                            discount,
                                            finalPrice,
                                            bundleApplied
                                        }) => (

                                            <div
                                                className="summary-service"
                                                key={
                                                    item.serviceId
                                                }
                                            >

                                                <div
                                                    className="summary-row"
                                                >

                                                    <span>
                                                        {
                                                            item.serviceName
                                                        }
                                                    </span>


                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                finalPrice
                                                            )
                                                        }
                                                    </strong>

                                                </div>


                                                {bundleApplied && (

                                                    <div
                                                        className="summary-row discount-row"
                                                    >

                                                        <span>
                                                            Bundle Discount
                                                        </span>


                                                        <strong>
                                                            -
                                                            {
                                                                formatCurrency(
                                                                    discount
                                                                )
                                                            }
                                                        </strong>

                                                    </div>

                                                )}

                                            </div>

                                        )
                                    )}


                                    <hr />


                                    <div
                                        className="summary-row"
                                    >

                                        <span>
                                            Original Total
                                        </span>


                                        <strong>
                                            {
                                                formatCurrency(
                                                    cartOriginalTotal
                                                )
                                            }
                                        </strong>

                                    </div>


                                    {cartBundleDiscount > 0 && (

                                        <div
                                            className="summary-row discount-row"
                                        >

                                            <span>
                                                Bundle Discount
                                            </span>


                                            <strong>
                                                -
                                                {
                                                    formatCurrency(
                                                        cartBundleDiscount
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    )}


                                    <hr />


                                    <div
                                        className="summary-row total"
                                    >

                                        <span>
                                            Final Total
                                        </span>


                                        <strong>
                                            {
                                                formatCurrency(
                                                    cartFinalTotal
                                                )
                                            }
                                        </strong>

                                    </div>


                                    {cartBundleDiscount === 0 && (

                                        <p
                                            className="payment-message"
                                        >

                                            No bundle discount
                                            is currently applied.

                                        </p>

                                    )}

                                </>

                            ) : (

                                /* =================================
                                   SINGLE SERVICE SUMMARY
                                ================================= */

                                <>

                                    {vendor?.imageUrl && (

                                        <img
                                            src={
                                                vendor.imageUrl
                                            }
                                            alt={
                                                vendor.businessName
                                            }
                                        />

                                    )}


                                    <h3>
                                        {
                                            vendor?.businessName
                                        }
                                    </h3>


                                    <p>
                                        📍{" "}
                                        {
                                            vendor?.city
                                        }
                                    </p>


                                    <hr />


                                    {pricingLoading && (

                                        <div
                                            className="pricing-loading"
                                        >

                                            Loading current
                                            pricing...

                                        </div>

                                    )}


                                    {!pricingLoading &&
                                        error && (

                                            <div
                                                className="pricing-error"
                                            >

                                                <p>
                                                    {
                                                        error
                                                    }
                                                </p>


                                                <button
                                                    className="save-button"
                                                    onClick={() =>
                                                        window.location.reload()
                                                    }
                                                >
                                                    Retry
                                                </button>

                                            </div>

                                        )}


                                    {!pricingLoading &&
                                        !error &&
                                        pricing && (

                                            <>

                                                <div
                                                    className="summary-row"
                                                >

                                                    <span>
                                                        Base Amount
                                                    </span>


                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                baseAmount
                                                            )
                                                        }
                                                    </strong>

                                                </div>


                                                {pricingHeads.map(
                                                    head => (

                                                        <div
                                                            className="summary-row"
                                                            key={
                                                                head.code
                                                            }
                                                        >

                                                            <span>
                                                                {
                                                                    head.name
                                                                }
                                                            </span>


                                                            <strong>
                                                                {
                                                                    formatCurrency(
                                                                        head.calculatedAmount
                                                                    )
                                                                }
                                                            </strong>

                                                        </div>

                                                    )
                                                )}


                                                <hr />


                                                <div
                                                    className="summary-row"
                                                >

                                                    <span>
                                                        Subtotal
                                                    </span>


                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                subtotal
                                                            )
                                                        }
                                                    </strong>

                                                </div>


                                                {discounts.map(
                                                    (
                                                        discount,
                                                        index
                                                    ) => (

                                                        <div
                                                            className="summary-row discount-row"
                                                            key={
                                                                `${discount.name}-${index}`
                                                            }
                                                        >

                                                            <span>
                                                                {
                                                                    discount.name
                                                                }
                                                            </span>


                                                            <strong>
                                                                -
                                                                {
                                                                    formatCurrency(
                                                                        discount.calculatedAmount
                                                                    )
                                                                }
                                                            </strong>

                                                        </div>

                                                    )
                                                )}


                                                {discountAmount > 0 && (

                                                    <div
                                                        className="summary-row discount-row"
                                                    >

                                                        <span>
                                                            Total Discount
                                                        </span>


                                                        <strong>
                                                            -
                                                            {
                                                                formatCurrency(
                                                                    discountAmount
                                                                )
                                                            }
                                                        </strong>

                                                    </div>

                                                )}


                                                <hr />


                                                <div
                                                    className="summary-row total"
                                                >

                                                    <span>
                                                        Total Estimate
                                                    </span>


                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                totalAmount
                                                            )
                                                        }
                                                    </strong>

                                                </div>


                                                {advanceAmount > 0 && (

                                                    <div
                                                        className="summary-row"
                                                    >

                                                        <span>
                                                            Advance Required
                                                        </span>


                                                        <strong>
                                                            {
                                                                formatCurrency(
                                                                    advanceAmount
                                                                )
                                                            }
                                                        </strong>

                                                    </div>

                                                )}


                                                {advanceAmount > 0 && (

                                                    <div
                                                        className="summary-row"
                                                    >

                                                        <span>
                                                            Balance After Advance
                                                        </span>


                                                        <strong>
                                                            {
                                                                formatCurrency(
                                                                    balanceAmount
                                                                )
                                                            }
                                                        </strong>

                                                    </div>

                                                )}

                                            </>

                                        )}

                                </>

                            )}


                            {/* =================================
                                ACTIONS
                            ================================= */}

                            <div
                                className="checkout-actions"
                            >

                                <button
                                    className="cancel-button"
                                    onClick={() =>
                                        navigate(-1)
                                    }
                                    disabled={
                                        submitting
                                    }
                                >

                                    {isCartCheckout
                                        ? "← Back To Cart"
                                        : "← Back To Vendor"
                                    }

                                </button>


                                <button
                                    className="save-button"
                                    disabled={
                                        submitting
                                    }
                                    onClick={() =>
                                        toast(
                                            "Save For Later will be implemented with the customer booking module."
                                        )
                                    }
                                >
                                    Save For Later
                                </button>


                                <button
                                    className="book-button"
                                    onClick={
                                        handleSubmit
                                    }
                                    disabled={
                                        submitting ||
                                        pricingLoading ||
                                        (
                                            !isCartCheckout &&
                                            (
                                                !pricing ||
                                                !!error
                                            )
                                        )
                                    }
                                >

                                    {
                                        submitting
                                            ? "Submitting..."
                                            : isCartCheckout
                                                ? "Continue To Checkout"
                                                : "Send Booking Request"
                                    }

                                </button>

                            </div>


                            <div
                                className="booking-note"
                            >

                                ✓ No payment is processed
                                when sending the booking request.

                            </div>


                        </div>

                    </div>

                </div>

            </div>

        </section>

    );

};


export default BookingCheckout;