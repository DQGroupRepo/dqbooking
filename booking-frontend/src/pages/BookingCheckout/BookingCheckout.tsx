import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../api/axiosConfig";

import CartService from "../../services/CartService";

import {
    createBooking
} from "../../services/bookingService";

import type {
    CartItem
} from "../../types/CartItem";

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


interface CartDisplayItem {

    item: CartItem;

    originalAmount: number;

    discountAmount: number;

    finalAmount: number;

}


const BookingCheckout = () => {

    const location =
        useLocation();

    const navigate =
        useNavigate();


    const state =
        location.state as BookingLocationState | null;


    const cart =
        state?.cart ?? [];


    const isCartCheckout =
        cart.length > 0;


    const vendor =
        state?.vendor ?? null;


    const serviceId =
        state?.serviceId ?? "";


    const initialEventDate =
        state?.eventDate ?? "";


    const initialGuests =
        state?.guests ?? "";


    const [
        eventDate,
        setEventDate
    ] = useState(
        initialEventDate
    );


    const [
        guests,
        setGuests
    ] = useState<number | string>(
        initialGuests
    );


    const [
        eventType,
        setEventType
    ] = useState("");


    const [
        specialRequest,
        setSpecialRequest
    ] = useState("");


    const [
        paymentPreference,
        setPaymentPreference
    ] = useState(
        "PAY_AFTER_CONFIRMATION"
    );


    const [
        pricing,
        setPricing
    ] = useState<PricingCalculationResult | null>(
        null
    );


    const [
        pricingLoading,
        setPricingLoading
    ] = useState(
        !isCartCheckout
    );


    const [
        submitting,
        setSubmitting
    ] = useState(false);


    const [
        error,
        setError
    ] = useState<string | null>(
        null
    );


    const formatCurrency = (
        amount:
            | number
            | null
            | undefined
    ) => {

        return `₹${(
            amount ?? 0
        ).toLocaleString(
            "en-IN"
        )}`;

    };


    const cartSubtotal =
        useMemo(() => {

            return cart.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.price
                    ),
                0
            );

        }, [cart]);


    const cartDisplayItems =
        useMemo<CartDisplayItem[]>(() => {

            const result:
                CartDisplayItem[] = [];

            const processedBundles =
                new Set<string>();


            cart.forEach(
                item => {

                    const originalAmount =
                        Number(
                            item.price
                        );


                    if (
                        !item.bundleId
                    ) {

                        result.push({

                            item,

                            originalAmount,

                            discountAmount: 0,

                            finalAmount:
                                originalAmount

                        });

                        return;

                    }


                    const bundleId =
                        item.bundleId;


                    if (
                        processedBundles.has(
                            bundleId
                        )
                    ) {

                        result.push({

                            item,

                            originalAmount,

                            discountAmount: 0,

                            finalAmount:
                                originalAmount

                        });

                        return;

                    }


                    processedBundles.add(
                        bundleId
                    );


                    const bundleItems =
                        cart.filter(
                            cartItem =>
                                cartItem.bundleId ===
                                bundleId
                        );


                    const requiredServiceIds =
                        item.bundleServiceIds ??
                        [];


                    const isComplete =
                        requiredServiceIds.length >
                            0 &&
                        requiredServiceIds.every(
                            requiredServiceId =>
                                bundleItems.some(
                                    bundleItem =>
                                        bundleItem.serviceId ===
                                            requiredServiceId &&
                                        bundleItem.bundleId ===
                                            bundleId
                                )
                        );


                    if (
                        !isComplete
                    ) {

                        bundleItems.forEach(
                            bundleItem => {

                                result.push({

                                    item: bundleItem,

                                    originalAmount:
                                        Number(
                                            bundleItem.price
                                        ),

                                    discountAmount: 0,

                                    finalAmount:
                                        Number(
                                            bundleItem.price
                                        )

                                });

                            }
                        );

                        return;

                    }


                    const bundleOriginalTotal =
                        bundleItems.reduce(
                            (
                                total,
                                bundleItem
                            ) =>
                                total +
                                Number(
                                    bundleItem.price
                                ),
                            0
                        );


                    let bundleDiscount =
                        0;


                    if (
                        item.bundleDiscountType ===
                        "PERCENTAGE"
                    ) {

                        bundleDiscount =
                            bundleOriginalTotal *
                            (
                                Number(
                                    item.bundleDiscountValue ??
                                    0
                                ) / 100
                            );

                    }


                    if (
                        item.bundleDiscountType ===
                        "FIXED"
                    ) {

                        bundleDiscount =
                            Math.min(
                                Number(
                                    item.bundleDiscountValue ??
                                    0
                                ),
                                bundleOriginalTotal
                            );

                    }


                    bundleItems.forEach(
                        bundleItem => {

                            const itemOriginalAmount =
                                Number(
                                    bundleItem.price
                                );


                            const proportion =
                                bundleOriginalTotal >
                                0

                                    ? itemOriginalAmount /
                                      bundleOriginalTotal

                                    : 0;


                            const itemDiscount =
                                bundleDiscount *
                                proportion;


                            result.push({

                                item:
                                    bundleItem,

                                originalAmount:
                                    itemOriginalAmount,

                                discountAmount:
                                    itemDiscount,

                                finalAmount:
                                    Math.max(
                                        0,
                                        itemOriginalAmount -
                                        itemDiscount
                                    )

                            });

                        }
                    );

                }
            );


            return result;

        }, [cart]);


    const totalBundleDiscount =
        useMemo(() => {

            return cartDisplayItems.reduce(
                (
                    total,
                    displayItem
                ) =>
                    total +
                    displayItem.discountAmount,
                0
            );

        }, [cartDisplayItems]);


    const finalCartTotal =
        useMemo(() => {

            return Math.max(
                0,
                cartSubtotal -
                totalBundleDiscount
            );

        }, [
            cartSubtotal,
            totalBundleDiscount
        ]);


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


    useEffect(() => {

        if (
            isCartCheckout ||
            !serviceId ||
            !eventDate
        ) {

            if (
                isCartCheckout
            ) {

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

                } catch (
                    err: any
                ) {

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


    const handleSubmit =
        async () => {

            if (
                submitting
            ) {

                return;

            }


            if (
                isCartCheckout
            ) {

                const missingEventDetails =
                    cart.some(
                        item =>
                            !item.eventDate ||
                            !item.guestCount ||
                            Number(
                                item.guestCount
                            ) < 1
                    );


                if (
                    missingEventDetails
                ) {

                    toast.error(
                        "Event date and guest count are missing for one or more selected services."
                    );

                    return;

                }

            } else {

                if (
                    !eventDate
                ) {

                    toast.error(
                        "Please select an event date."
                    );

                    return;

                }


                if (
                    !guests ||
                    Number(
                        guests
                    ) < 1
                ) {

                    toast.error(
                        "Please enter a valid guest count."
                    );

                    return;

                }

            }


            if (
                !eventType.trim()
            ) {

                toast.error(
                    "Please enter the event type."
                );

                return;

            }


            if (
                isCartCheckout
            ) {

                try {

                    setSubmitting(
                        true
                    );


                    const request = {

                        serviceIds:
                            cart.map(
                                item =>
                                    item.serviceId
                            ),

                        eventDate:
                            cart[0]?.eventDate ||
                            "",

                        guestCount:
                            Number(
                                cart[0]?.guestCount ||
                                0
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

                } catch (
                    err: any
                ) {

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

            } catch (
                err: any
            ) {

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


    const baseAmount =
        pricing?.baseAmount ??
        0;


    const pricingHeads =
        pricing?.pricingHeads ??
        [];


    const discounts =
        pricing?.discounts ??
        [];


    const subtotal =
        pricing?.subtotal ??
        0;


    const discountAmount =
        pricing?.discountAmount ??
        0;


    const totalAmount =
        pricing?.totalAmount ??
        0;


    const advanceAmount =
        pricing?.advanceAmount ??
        0;


    const balanceAmount =
        pricing?.balanceAmount ??
        0;


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


                    <div className="checkout-main">


                        {isCartCheckout && (

                            <div className="checkout-card">

                                <h2>
                                    Selected Services
                                </h2>


                                <p>
                                    Services selected for this checkout.
                                </p>


                                <div className="checkout-cart-items">

                                    {cartDisplayItems.map(
                                        (
                                            displayItem
                                        ) => {

                                            const item =
                                                displayItem.item;


                                            return (

                                                <div
                                                    key={
                                                        item.serviceId
                                                    }
                                                    className="checkout-cart-item"
                                                >

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
                                                                "Not selected"
                                                            }
                                                        </small>


                                                        <small>
                                                            Guests:{" "}
                                                            {
                                                                item.guestCount ??
                                                                "-"
                                                            }
                                                        </small>

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            Final:{" "}
                                                            {formatCurrency(
                                                                displayItem.finalAmount
                                                            )}
                                                        </strong>


                                                        {displayItem.discountAmount >
                                                            0 && (

                                                            <small className="discount-row">

                                                                Original:{" "}
                                                                {formatCurrency(
                                                                    displayItem.originalAmount
                                                                )}


                                                                {" • "}


                                                                Bundle Discount: -{" "}
                                                                {formatCurrency(
                                                                    displayItem.discountAmount
                                                                )}

                                                            </small>

                                                        )}


                                                        {displayItem.discountAmount ===
                                                            0 && (

                                                            <small>

                                                                Original:{" "}
                                                                {formatCurrency(
                                                                    displayItem.originalAmount
                                                                )}

                                                            </small>

                                                        )}

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>


                                {totalBundleDiscount >
                                    0 && (

                                    <div className="summary-row discount-row">

                                        <span>
                                            Total Bundle Discount
                                        </span>

                                        <strong>
                                            -
                                            {formatCurrency(
                                                totalBundleDiscount
                                            )}
                                        </strong>

                                    </div>

                                )}

                            </div>

                        )}


                        {!isCartCheckout &&
                            vendor && (

                            <div className="checkout-card">

                                <h2>
                                    Booking Summary
                                </h2>


                                <div className="booking-summary-grid">

                                    <div className="summary-item">

                                        <label>
                                            Vendor
                                        </label>

                                        <p>
                                            {
                                                vendor.businessName
                                            }
                                        </p>

                                    </div>


                                    <div className="summary-item">

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


                                    <div className="summary-item">

                                        <label>
                                            Guests
                                        </label>

                                        <p>
                                            {
                                                guests
                                            }
                                        </p>

                                    </div>


                                    <div className="summary-item">

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


                        <div className="checkout-card">

                            <h2>
                                Payment Preference
                            </h2>


                            <label className="radio-option">

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


                            <label className="radio-option">

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


                            <label className="radio-option">

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


                            <p className="payment-message">

                                {
                                    paymentMessage
                                }

                            </p>

                        </div>

                    </div>


                    <div className="checkout-sidebar">

                        <div className="booking-summary">


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
                                            cart.length !==
                                            1
                                                ? "s"
                                                : ""
                                        }
                                    </p>


                                    <hr />


                                    {cartDisplayItems.map(
                                        (
                                            displayItem
                                        ) => (

                                            <div
                                                className="summary-row"
                                                key={
                                                    displayItem.item.serviceId
                                                }
                                            >

                                                <span>
                                                    {
                                                        displayItem.item.serviceName
                                                    }
                                                </span>


                                                <strong>
                                                    {formatCurrency(
                                                        displayItem.finalAmount
                                                    )}
                                                </strong>

                                            </div>

                                        )
                                    )}


                                    <hr />


                                    <div className="summary-row">

                                        <span>
                                            Original Total
                                        </span>


                                        <strong>
                                            {formatCurrency(
                                                cartSubtotal
                                            )}
                                        </strong>

                                    </div>


                                    <div className="summary-row discount-row">

                                        <span>
                                            Bundle Discount
                                        </span>


                                        <strong>
                                            -
                                            {formatCurrency(
                                                totalBundleDiscount
                                            )}
                                        </strong>

                                    </div>


                                    <hr />


                                    <div className="summary-row total">

                                        <span>
                                            Final Total
                                        </span>


                                        <strong>
                                            {formatCurrency(
                                                finalCartTotal
                                            )}
                                        </strong>

                                    </div>


                                    {totalBundleDiscount ===
                                        0 && (

                                        <p className="payment-message">

                                            No bundle discount applies
                                            to the selected services.

                                        </p>

                                    )}

                                </>

                            ) : (

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

                                        <div className="pricing-loading">

                                            Loading current pricing...

                                        </div>

                                    )}


                                    {!pricingLoading &&
                                        error && (

                                        <div className="pricing-error">

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

                                            <div className="summary-row">

                                                <span>
                                                    Base Amount
                                                </span>


                                                <strong>
                                                    {formatCurrency(
                                                        baseAmount
                                                    )}
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
                                                            {formatCurrency(
                                                                head.calculatedAmount
                                                            )}
                                                        </strong>

                                                    </div>

                                                )
                                            )}


                                            <hr />


                                            <div className="summary-row">

                                                <span>
                                                    Subtotal
                                                </span>


                                                <strong>
                                                    {formatCurrency(
                                                        subtotal
                                                    )}
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
                                                            {formatCurrency(
                                                                discount.calculatedAmount
                                                            )}
                                                        </strong>

                                                    </div>

                                                )
                                            )}


                                            {discountAmount >
                                                0 && (

                                                <div className="summary-row discount-row">

                                                    <span>
                                                        Total Discount
                                                    </span>


                                                    <strong>
                                                        -
                                                        {formatCurrency(
                                                            discountAmount
                                                        )}
                                                    </strong>

                                                </div>

                                            )}


                                            <hr />


                                            <div className="summary-row total">

                                                <span>
                                                    Total Estimate
                                                </span>


                                                <strong>
                                                    {formatCurrency(
                                                        totalAmount
                                                    )}
                                                </strong>

                                            </div>


                                            {advanceAmount >
                                                0 && (

                                                <div className="summary-row">

                                                    <span>
                                                        Advance Required
                                                    </span>


                                                    <strong>
                                                        {formatCurrency(
                                                            advanceAmount
                                                        )}
                                                    </strong>

                                                </div>

                                            )}


                                            {advanceAmount >
                                                0 && (

                                                <div className="summary-row">

                                                    <span>
                                                        Balance After Advance
                                                    </span>


                                                    <strong>
                                                        {formatCurrency(
                                                            balanceAmount
                                                        )}
                                                    </strong>

                                                </div>

                                            )}

                                        </>

                                    )}

                                </>

                            )}


                            <div className="checkout-actions">

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


                            <div className="booking-note">

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