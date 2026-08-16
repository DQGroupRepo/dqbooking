import {    useEffect,
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


interface BundleDiscountItem {

    serviceId: string;

    serviceName: string;

    vendorId: string;

    originalAmount: number;

    discountValue: number;

    discountAmount: number;

    finalAmount: number;

    bundleApplied: boolean;

}


interface BundleCalculationResponse {

    bundleApplied: boolean;

    vendorId?: string | null;

    qualifyingServiceCount: number;

    totalDiscount: number;

    originalTotal: number;

    finalTotal: number;

    items: BundleDiscountItem[];

}

interface BookingBundleItemRequest {
     bundleId: string;
     items: BookingServiceItemRequest[];
 }

interface BookingServiceItemRequest {
    serviceId: string;
    eventDate: string;
    guestCount: number;
}

interface CreateBookingRequest {
    bundles: BookingBundleItemRequest[];
    services: BookingServiceItemRequest[];
    specialRequest: string;
    eventType: string;
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


    const [eventDate, setEventDate] =
        useState(
            initialEventDate
        );


    const [guests, setGuests] =
        useState<number | string>(
            initialGuests
        );


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


    const [
        pricing,
        setPricing
    ] =
        useState<PricingCalculationResult | null>(
            null
        );


    const [
        bundlePricing,
        setBundlePricing
    ] =
        useState<BundleCalculationResponse | null>(
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
     * CART TOTAL
     * =========================================
     *
     * Always use the original cart prices here.
     *
     * Bundle discount is calculated separately.
     */

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


    /*
     * =========================================
     * LOCAL BUNDLE DISCOUNT CALCULATION
     * =========================================
     *
     * This is now the important part.
     *
     * We use the bundle information already
     * stored inside CartItem / CartService.
     *
     * This prevents the checkout display from
     * becoming dependent only on the API response.
     */


    const localBundleDiscounts =
        useMemo(() => {

            const discountMap =
                new Map<
                    string,
                    number
                >();


            /*
             * Find unique bundle IDs.
             */

            const bundleIds =
                Array.from(
                    new Set(
                        cart
                            .map(
                                item =>
                                    item.bundleId
                            )
                            .filter(
                                (
                                    bundleId
                                ): bundleId is string =>
                                    !!bundleId
                            )
                    )
                );


            bundleIds.forEach(
                bundleId => {

                    /*
                     * Make sure the bundle is
                     * actually complete.
                     */

                    if (
                        !CartService.isBundleComplete(
                            bundleId
                        )
                    ) {

                        return;

                    }


                    const bundleItems =
                        cart.filter(
                            item =>
                                item.bundleId ===
                                bundleId
                        );


                    if (
                        bundleItems.length === 0
                    ) {

                        return;

                    }


                    /*
                     * Original price of this bundle.
                     */

                    const originalPrice =
                        bundleItems.reduce(
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


                    if (
                        originalPrice <= 0
                    ) {

                        return;

                    }


                    /*
                     * Bundle configuration is
                     * stored on every CartItem.
                     *
                     * Use the first item as the
                     * bundle configuration.
                     */

                    const firstItem =
                        bundleItems[0];


                    const discountType =
                        firstItem.bundleDiscountType;


                    const discountValue =
                        Number(
                            firstItem.bundleDiscountValue ??
                            0
                        );


                    let totalBundleDiscount =
                        0;


                    /*
                     * PERCENTAGE BUNDLE
                     */

                    if (
                        discountType ===
                        "PERCENTAGE"
                    ) {

                        totalBundleDiscount =
                            originalPrice *
                            (
                                discountValue /
                                100
                            );

                    }


                    /*
                     * FIXED BUNDLE
                     */

                    if (
                        discountType ===
                        "FIXED"
                    ) {

                        totalBundleDiscount =
                            Math.min(
                                discountValue,
                                originalPrice
                            );

                    }


                    if (
                        totalBundleDiscount <= 0
                    ) {

                        return;

                    }


                    /*
                     * Allocate the bundle discount
                     * proportionally across services.
                     *
                     * Example:
                     *
                     * Service A = ₹1000
                     * Service B = ₹1000
                     *
                     * Bundle discount = ₹500
                     *
                     * A gets ₹250
                     * B gets ₹250
                     */

                    bundleItems.forEach(
                        item => {

                            const itemPrice =
                                Number(
                                    item.price
                                );


                            if (
                                itemPrice <= 0
                            ) {

                                discountMap.set(
                                    item.serviceId,
                                    0
                                );

                                return;

                            }


                            const itemShare =
                                itemPrice /
                                originalPrice;


                            const itemDiscount =
                                totalBundleDiscount *
                                itemShare;


                            discountMap.set(
                                item.serviceId,
                                itemDiscount
                            );

                        }
                    );

                }
            );


            return discountMap;

        }, [cart]);


    /*
     * =========================================
     * LOCAL TOTAL BUNDLE DISCOUNT
     * =========================================
     */

    const localTotalBundleDiscount =
        useMemo(() => {

            let total = 0;


            localBundleDiscounts.forEach(
                discount => {

                    total +=
                        Number(
                            discount
                        );

                }
            );


            return total;

        }, [
            localBundleDiscounts
        ]);


    /*
     * =========================================
     * LOCAL FINAL TOTAL
     * =========================================
     */

    const localBundleFinalTotal =
        useMemo(() => {

            return Math.max(
                0,
                cartSubtotal -
                localTotalBundleDiscount
            );

        }, [
            cartSubtotal,
            localTotalBundleDiscount
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
                "en-IN",
                {
                    maximumFractionDigits: 2
                }
            )}`;

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


    /*
     * =========================================
     * CALCULATE CART BUNDLE
     * =========================================
     *
     * The API calculation is still performed.
     *
     * It remains useful for the backend booking
     * flow, but the DISPLAY uses the local
     * CartItem bundle calculation above.
     */

    useEffect(() => {

        if (
            !isCartCheckout ||
            cart.length === 0
        ) {

            setBundlePricing(
                null
            );

            return;

        }


        const calculateBundle =
            async () => {

                try {

                    setPricingLoading(
                        true
                    );


                    setError(
                        null
                    );


                    const response =
                        await api.post<BundleCalculationResponse>(
                            "/bundles/calculate",
                            {
                                serviceIds:
                                    cart.map(
                                        item =>
                                            item.serviceId
                                    )
                            }
                        );


                    setBundlePricing(
                        response.data
                    );


                } catch (
                    err: any
                ) {

                    console.error(
                        "Bundle calculation failed:",
                        err
                    );


                    /*
                     * IMPORTANT:
                     *
                     * Do NOT clear the local bundle
                     * calculation just because the API
                     * calculation failed.
                     *
                     * The CartItem information is still
                     * enough to display the bundle
                     * discount.
                     */

                    setBundlePricing(
                        null
                    );


                } finally {

                    setPricingLoading(
                        false
                    );

                }

            };


        calculateBundle();

    }, [
        cart,
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

    /*
     * =========================================
     * SUBMIT BOOKING
     * =========================================
     */

    const handleSubmit = async () => {

        console.log("========== HANDLE SUBMIT ==========");
        console.log("isCartCheckout:", isCartCheckout);
        console.log("eventType:", eventType);
        console.log("cart:", cart);

        if (submitting) {
            return;
        }


        /*
         * =========================================
         * EVENT TYPE VALIDATION
         * =========================================
         */

        if (!eventType.trim()) {

            toast.error(
                "Please enter the event type."
            );

            return;
        }


        /*
         * =========================================
         * CART BOOKING
         * =========================================
         */

        if (isCartCheckout) {

            try {

                setSubmitting(true);


                const bundleMap =
                    new Map<string, BookingBundleRequest>();

                const serviceRequests:
                    BookingServiceItemRequest[] = [];

                cart.forEach(item => {

                    /*
                     * =========================================
                     * COMPLETED BUNDLE SERVICE
                     * =========================================
                     */

                    if (
                        item.bundleId &&
                        CartService.isBundleComplete(
                            item.bundleId
                        )
                    ) {

                        let bundleRequest =
                            bundleMap.get(
                                item.bundleId
                            );

                        /*
                         * Create the bundle container
                         * the first time we encounter it.
                         */

                        if (!bundleRequest) {

                            bundleRequest = {

                                bundleId:
                                    item.bundleId,

                                items: []

                            };

                            bundleMap.set(
                                item.bundleId,
                                bundleRequest
                            );
                        }


                        /*
                         * Every service keeps its own
                         * event date and guest count.
                         */

                        bundleRequest.items.push({

                            serviceId:
                                item.serviceId,

                            eventDate:
                                item.eventDate,

                            guestCount:
                                Number(
                                    item.guestCount
                                )

                        });

                        return;
                    }


                    /*
                     * =========================================
                     * NORMAL SERVICE
                     * =========================================
                     */

                    serviceRequests.push({

                        serviceId:
                            item.serviceId,

                        eventDate:
                            item.eventDate,

                        guestCount:
                            Number(
                                item.guestCount
                            )

                    });

                });


                /*
                 * Convert Map into array.
                 */

                const bundleRequests =
                    Array.from(
                        bundleMap.values()
                    );


                /*
                 * =========================================
                 * CREATE REQUEST
                 * =========================================
                 */

                const request:
                    CreateBookingRequest = {

                    bundles:
                        bundleRequests,

                    services:
                        serviceRequests,

                    specialRequest:
                        specialRequest.trim(),

                    eventType:
                        eventType.trim()

                };


                console.log(
                    "========== BOOKING REQUEST =========="
                );

                console.log(
                    JSON.stringify(
                        request,
                        null,
                        2
                    )
                );


                /*
                 * =========================================
                 * API REQUEST
                 * =========================================
                 */

                const response =
                    await api.post(
                        "/bookings",
                        request
                    );


                console.log(
                    "========== BOOKING RESPONSE =========="
                );

                console.log(
                    response.data
                );


                const booking =
                    response.data;


                /*
                 * =========================================
                 * CLEAR CART
                 * =========================================
                 */

                CartService.clearCart();


                /*
                 * =========================================
                 * SUCCESS
                 * =========================================
                 */

                toast.success(
                    booking?.bookingNumber
                        ? `Booking request ${booking.bookingNumber} submitted successfully!`
                        : "Booking request submitted successfully!"
                );


                /*
                 * =========================================
                 * CONFIRMATION
                 * =========================================
                 */

                navigate(
                    `/booking-confirmation/${booking.bookingGroupId}`,
                    {
                        state: {
                            booking
                        }
                    }
                );


            } catch (err: any) {

                console.error(
                    "========== BOOKING CREATION FAILED =========="
                );

                console.error(
                    err
                );

                console.error(
                    err?.response?.data
                );


                const message =
                    err?.response?.data?.message ||
                    "Unable to submit booking request. Please try again.";


                toast.error(
                    message
                );


            } finally {

                setSubmitting(false);

            }


            return;
        }


        /*
         * =========================================
         * DIRECT SINGLE SERVICE BOOKING
         * =========================================
         */

        try {

            setSubmitting(true);


            const bookingRequest:
                CreateBookingRequest = {

                bundles: [],

                services: [

                    {
                        serviceId,

                        eventDate,

                        guestCount:
                            Number(
                                guests
                            )
                    }

                ],

                specialRequest:
                    specialRequest.trim(),

                eventType:
                    eventType.trim()

            };


            console.log(
                "========== DIRECT BOOKING REQUEST =========="
            );

            console.log(
                JSON.stringify(
                    bookingRequest,
                    null,
                    2
                )
            );


            const response =
                await api.post(
                    "/bookings",
                    bookingRequest
                );


            const booking =
                response.data;


            toast.success(
                booking?.bookingNumber
                    ? `Booking request ${booking.bookingNumber} submitted successfully!`
                    : "Booking request submitted successfully!"
            );


            navigate(
                `/booking-confirmation/${booking.bookingGroupId}`,
                {
                    state: {
                        booking
                    }
                }
            );


        } catch (err: any) {

            console.error(
                "========== DIRECT BOOKING FAILED =========="
            );

            console.error(
                err
            );

            console.error(
                err?.response?.data
            );


            const message =
                err?.response?.data?.message ||
                "Unable to submit booking request. Please try again.";


            toast.error(
                message
            );


        } finally {

            setSubmitting(false);

        }

    };


    /*
     * =========================================
     * SINGLE SERVICE PRICING DATA
     * =========================================
     */

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

    const bundleTotal =
        bundlePricing?.originalTotal ??
        cartSubtotal;

    const bundleDiscount =
        bundlePricing?.totalDiscount ??
        0;

    const bundleFinalTotal =
        bundlePricing?.finalTotal ??
        cartSubtotal;

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
                            CART SERVICES
                        ================================= */}

                        {isCartCheckout && (

                            <div className="checkout-card">

                                <h2>
                                    Selected Services
                                </h2>

                                <p className="selected-services-subtitle">
                                    Services selected for this checkout.
                                </p>


                                <div className="checkout-cart-items">

                                    {cart.map((item) => {

                                        const bundleItem =
                                            bundlePricing?.items?.find(
                                                bundle =>
                                                    bundle.serviceId ===
                                                    item.serviceId
                                            );


                                        const originalAmount =
                                            bundleItem?.originalAmount ??
                                            Number(item.price);


                                        const finalAmount =
                                            bundleItem?.finalAmount ??
                                            Number(item.price);


                                        const discountAmount =
                                            bundleItem?.discountAmount ??
                                            0;


                                        return (

                                            <div
                                                key={item.serviceId}
                                                className="checkout-cart-item"
                                            >

                                                {/* =================================
                                                    FIRST ROW
                                                ================================= */}

                                                <div className="checkout-service-first-row">

                                                    {/* SERVICE INFORMATION */}

                                                    <div className="checkout-service-info">

                                                        <strong className="checkout-service-name">
                                                            {item.serviceName}
                                                        </strong>


                                                        {item.vendorName && (

                                                            <span className="checkout-service-vendor">
                                                                {item.vendorName}
                                                            </span>

                                                        )}


                                                        {item.category && (

                                                            <span className="checkout-service-category">
                                                                {item.category}
                                                            </span>

                                                        )}

                                                    </div>


                                                    {/* EVENT DATE */}

                                                    <div className="checkout-service-event-date">

                                                        <strong>
                                                            Event Date:
                                                        </strong>{" "}

                                                        {item.eventDate ||
                                                            "Not Selected"}

                                                    </div>


                                                    {/* GUESTS */}

                                                    <div className="checkout-service-guests">

                                                        <strong>
                                                            Guests:
                                                        </strong>{" "}

                                                        {item.guestCount || 0}

                                                    </div>


                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        className="remove-service-button"
                                                        onClick={() =>
                                                            handleRemoveService(item)
                                                        }
                                                        title="Remove service"
                                                    >
                                                        🗑
                                                    </button>

                                                </div>


                                                {/* =================================
                                                    SECOND ROW - PRICING
                                                ================================= */}

                                                <div className="checkout-service-second-row">

                                                    <div className="checkout-service-pricing">

                                                        <span className="final-price">

                                                            <strong>
                                                                Final:
                                                            </strong>{" "}

                                                            {formatCurrency(
                                                                finalAmount
                                                            )}

                                                        </span>


                                                        <span className="original-price">

                                                            <strong>
                                                                Original:
                                                            </strong>{" "}

                                                            {formatCurrency(
                                                                originalAmount
                                                            )}

                                                        </span>


                                                        {discountAmount > 0 && (

                                                            <span className="service-bundle-discount">

                                                                <strong>
                                                                    Bundle Discount:
                                                                </strong>{" "}

                                                                -
                                                                {formatCurrency(
                                                                    discountAmount
                                                                )}

                                                            </span>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>

                                        );

                                    })}


                                    {/* =================================
                                        TOTAL BUNDLE DISCOUNT
                                    ================================= */}

                                    {bundleDiscount > 0 && (

                                        <div className="total-bundle-discount-row">

                                            <span>
                                                Total Bundle Discount
                                            </span>

                                            <strong>
                                                -
                                                {formatCurrency(
                                                    bundleDiscount
                                                )}
                                            </strong>

                                        </div>

                                    )}

                                </div>

                            </div>

                        )}


                        {/* =================================
                            BOOKING SUMMARY
                        ================================= */}

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


                                    {cart.map(
                                        (
                                            item
                                        ) => {

                                            const itemDiscount =
                                                localBundleDiscounts.get(
                                                    item.serviceId
                                                ) ??
                                                0;


                                            const itemFinalPrice =
                                                Math.max(
                                                    0,
                                                    Number(
                                                        item.price
                                                    ) -
                                                    itemDiscount
                                                );


                                            return (

                                                <div
                                                    className="summary-row"
                                                    key={
                                                        item.serviceId
                                                    }
                                                >

                                                    <span>
                                                        {
                                                            item.serviceName
                                                        }
                                                    </span>


                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                itemFinalPrice
                                                            )
                                                        }
                                                    </strong>

                                                </div>

                                            );

                                        }
                                    )}


                                    <hr />


                                    {/* =================================
                                        ORIGINAL TOTAL
                                    ================================= */}

                                    <div
                                        className="summary-row"
                                    >

                                        <span>
                                            Original Total
                                        </span>


                                        <strong>
                                            {
                                                formatCurrency(
                                                    cartSubtotal
                                                )
                                            }
                                        </strong>

                                    </div>


                                    {/* =================================
                                        TOTAL BUNDLE DISCOUNT
                                        ONLY SHOWN HERE
                                    ================================= */}

                                    {localTotalBundleDiscount > 0 && (

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
                                                        localTotalBundleDiscount
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    )}


                                    <hr />


                                    {/* =================================
                                        FINAL TOTAL
                                    ================================= */}

                                    <div
                                        className="summary-row total"
                                    >

                                        <span>
                                            Final Total
                                        </span>


                                        <strong>
                                            {
                                                formatCurrency(
                                                    localBundleFinalTotal
                                                )
                                            }
                                        </strong>

                                    </div>


                                    {localTotalBundleDiscount <= 0 && (

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
                                                        {
                                                            formatCurrency(
                                                                baseAmount
                                                            )
                                                        }
                                                    </strong>

                                                </div>


                                                {pricingHeads.map(
                                                    (
                                                        head
                                                    ) => (

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


                                                <div className="summary-row">

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

                                                    <div className="summary-row">

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

                                                    <div className="summary-row">

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
                                    {
                                        isCartCheckout
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
                                    onClick={handleSubmit}
                                    disabled={
                                        submitting ||
                                        (
                                            !isCartCheckout &&
                                            (
                                                pricingLoading ||
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