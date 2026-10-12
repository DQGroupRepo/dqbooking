import { useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../api/axiosConfig";

import CartService from "../../services/CartService";

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

    slotId?: string;

    packageId?: string;

    selectedCateringDishes?: BookingSelectedCateringDishRequest[];

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

interface BookingSelectedCateringDishRequest {

    dishId?: string;

    menuItemId?: string;

    name: string;

    category: string;

    foodType: string;

    custom: boolean;
}


interface BookingServiceItemRequest {

    serviceId: string;

    slotId: string;

    packageId?: string;

    eventDate: string;

    guestCount: number;
    selectedCateringDishes?: BookingSelectedCateringDishRequest[];

}


interface CreateBookingRequest {

    bundles: BookingBundleItemRequest[];

    services: BookingServiceItemRequest[];

    specialRequest: string;

    eventType: string;

}


interface BundleBookingResponse {

    id: string;

    bookingGroupId?: string;

    bookingNumber?: string;

    status?: string;

    totalAmount?: number;

}


interface CartItemPricing {

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


const EMPTY_CART: CartItem[] = [];


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

    // Keep the normalized cart reference stable between renders. Returning a
    // new [] on every render can retrigger pricing effects indefinitely.
    // Router state is runtime data, so validate it before using array methods.
    const cart: CartItem[] = useMemo(() => {
        if (Array.isArray(state?.cart)) {
            return state.cart;
        }

        return state?.cart != null
            ? CartService.getCart()
            : EMPTY_CART;
    }, [state?.cart]);


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


    const packageId =
        state?.packageId ?? "";


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


    /*
     * =========================================
     * BUNDLE PRICING
     * =========================================
     */

    const [
        bundlePricing,
        setBundlePricing
    ] =
        useState<BundleCalculationResponse | null>(
            null
        );


    /*
     * =========================================
     * CART ITEM PRICING
     * =========================================
     *
     * Each cart item can have:
     *
     * - its own package
     * - its own event date
     * - its own pricing heads
     * - its own discounts
     */

    const [
        cartItemPricing,
        setCartItemPricing
    ] = useState<
        Record<string, CartItemPricing>
    >({});


    /*
     * =========================================
     * LOADING
     * =========================================
     */

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
     * Uses calculated pricing subtotal.
     *
     * This includes:
     *
     * package price
     * +
     * pricing heads
     */

    const cartSubtotal =
        useMemo(() => {

            return cart.reduce(
                (
                    total,
                    item
                ) => {

                    const pricing =
                        cartItemPricing[
                        item.serviceId
                        ];


                    return (
                        total +
                        Number(
                            pricing?.subtotal ??
                            item.price
                        )
                    );

                },
                0
            );

        }, [
            cart,
            cartItemPricing
        ]);


    /*
     * =========================================
     * LOCAL BUNDLE DISCOUNT CALCULATION
     * =========================================
     *
     * This is only used for displaying the
     * checkout totals.
     *
     * Backend remains authoritative.
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
                     * Only calculate discount
                     * for a completed bundle.
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
                     * Original bundle amount
                     * based on calculated subtotals.
                     */

                    const originalPrice =
                        bundleItems.reduce(
                            (
                                total,
                                item
                            ) => {

                                const pricing =
                                    cartItemPricing[
                                    item.serviceId
                                    ];


                                return (
                                    total +
                                    Number(
                                        pricing?.subtotal ??
                                        item.price
                                    )
                                );

                            },
                            0
                        );


                    if (
                        originalPrice <= 0
                    ) {

                        return;

                    }


                    /*
                     * Bundle configuration is
                     * available on every cart item.
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
                     * PERCENTAGE
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
                     * FIXED
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
                     * Allocate discount
                     * proportionally across
                     * bundle services.
                     */

                    bundleItems.forEach(
                        item => {

                            const itemPricing =
                                cartItemPricing[
                                item.serviceId
                                ];


                            const itemPrice =
                                Number(
                                    itemPricing?.subtotal ??
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

        }, [
            cart,
            cartItemPricing
        ]);


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

    const formatCurrency = (
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
     * REMOVE SERVICE
     * =========================================
     *
     * Existing bundle behavior is preserved:
     *
     * Removing a service from a bundle also
     * removes the bundle association from
     * the remaining bundle services.
     */

    const handleRemoveService = async (
        item: CartItem
    ) => {

        let updatedCart: CartItem[];


        if (
            item.bundleId
        ) {

            updatedCart =
                await CartService.removeItemFromBundle(
                    item.serviceId,
                    item.bundleId
                );

        } else {

            updatedCart =
                await CartService.removeItem(
                    item.serviceId
                );

        }


        setCurrentCart(
            updatedCart
        );

    };


    /*
     * NOTE:
     *
     * React state is not being used for the cart
     * itself in the existing implementation.
     *
     * Therefore keep a local state copy so that
     * removing an item immediately updates this
     * page.
     */

    const [
        currentCart,
        setCurrentCart
    ] =
        useState<CartItem[]>(
            Array.isArray(cart) ? cart : []
        );


    /*
     * Keep currentCart synchronized with
     * navigation state.
     */

    useEffect(() => {

        setCurrentCart(
            Array.isArray(cart) ? cart : []
        );

    }, [
        state
    ]);


    /*
     * IMPORTANT:
     *
     * The calculations above should use currentCart
     * after a removal.
     *
     * To avoid changing the rest of the file's
     * existing logic, cart references are handled
     * below through displayCart.
     */

    // Keep render paths safe even if stale state or an unexpected caller
    // ever supplies a non-array value. CartService.getCart() also validates
    // persisted cart data, so use it as a recovery source when appropriate.
    const displayCart: CartItem[] =
        Array.isArray(currentCart)
            ? currentCart
            : (isCartCheckout ? CartService.getCart() : []);


    const isDisplayCartCheckout =
        displayCart.length > 0;


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

                                    eventDate,

                                    packageId:
                                        packageId || undefined

                                }
                            }
                        );


                    setPricing(
                        response.data
                    );

                }
                catch (
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

                }
                finally {

                    setPricingLoading(
                        false
                    );

                }

            };


        loadPricing();

    }, [
        serviceId,
        packageId,
        eventDate,
        isCartCheckout
    ]);


    /*
     * =========================================
     * CALCULATE CART BUNDLE
     * =========================================
     */

    useEffect(() => {

        if (
            !isCartCheckout ||
            displayCart.length === 0
        ) {

            setBundlePricing(null);

            return;

        }


        const calculateBundles =
            async () => {

                try {

                    setPricingLoading(true);

                    setError(null);


                    /*
                     * =========================================
                     * GROUP CART ITEMS BY BUNDLE
                     * =========================================
                     */

                    const bundleGroups =
                        displayCart
                            .filter(
                                item =>
                                    !!item.bundleId
                            )
                            .reduce(
                                (
                                    map,
                                    item
                                ) => {

                                    const bundleId =
                                        item.bundleId!;


                                    if (
                                        !map.has(
                                            bundleId
                                        )
                                    ) {

                                        map.set(
                                            bundleId,
                                            []
                                        );

                                    }


                                    map.get(
                                        bundleId
                                    )!.push(
                                        item
                                    );


                                    return map;

                                },
                                new Map<
                                    string,
                                    CartItem[]
                                >()
                            );


                    /*
                     * =========================================
                     * CALCULATE EACH BUNDLE
                     * =========================================
                     */

                    const results =
                        await Promise.all(

                            Array.from(
                                bundleGroups.entries()
                            )
                                .map(
                                    async ([
                                        bundleId,
                                        items
                                    ]) => {

                                        try {

                                            const response =
                                                await api.post<BundleCalculationResponse>(
                                                    "/bundles/calculate",
                                                    {

                                                        bundleId,

                                                        items:
                                                            items.map(
                                                                item => ({

                                                                    serviceId:
                                                                        item.serviceId,

                                                                    packageId:
                                                                        item.packageId

                                                                })
                                                            )

                                                    }
                                                );


                                            return response.data;

                                        }
                                        catch (error) {

                                            console.error(
                                                `Bundle calculation failed for ${bundleId}:`,
                                                error
                                            );


                                            return null;

                                        }

                                    }
                                )

                        );


                    /*
                     * =========================================
                     * COMBINE BUNDLE RESULTS
                     * =========================================
                     */

                    const validResults =
                        results.filter(
                            (
                                result
                            ): result is BundleCalculationResponse =>
                                result !== null
                        );


                    if (
                        validResults.length === 0
                    ) {

                        setBundlePricing(null);

                        return;

                    }


                    const combinedItems =
                        validResults.flatMap(
                            result =>
                                result.items ?? []
                        );


                    const combinedOriginalTotal =
                        validResults.reduce(
                            (
                                total,
                                result
                            ) =>
                                total +
                                Number(
                                    result.originalTotal ?? 0
                                ),
                            0
                        );


                    const combinedDiscount =
                        validResults.reduce(
                            (
                                total,
                                result
                            ) =>
                                total +
                                Number(
                                    result.totalDiscount ?? 0
                                ),
                            0
                        );


                    const combinedFinalTotal =
                        validResults.reduce(
                            (
                                total,
                                result
                            ) =>
                                total +
                                Number(
                                    result.finalTotal ?? 0
                                ),
                            0
                        );


                    const combinedBundleApplied =
                        validResults.some(
                            result =>
                                result.bundleApplied
                        );


                    const combinedQualifyingCount =
                        validResults.reduce(
                            (
                                total,
                                result
                            ) =>
                                total +
                                Number(
                                    result.qualifyingServiceCount ?? 0
                                ),
                            0
                        );


                    setBundlePricing({

                        bundleApplied:
                            combinedBundleApplied,

                        qualifyingServiceCount:
                            combinedQualifyingCount,

                        originalTotal:
                            combinedOriginalTotal,

                        totalDiscount:
                            combinedDiscount,

                        finalTotal:
                            combinedFinalTotal,

                        items:
                            combinedItems

                    });


                }
                catch (error) {

                    console.error(
                        "Bundle calculation failed:",
                        error
                    );


                    setBundlePricing(null);

                }
                finally {

                    setPricingLoading(false);

                }

            };


        calculateBundles();

    }, [
        displayCart,
        isCartCheckout
    ]);


    /*
     * =========================================
     * LOAD CART ITEM PRICING
     * =========================================
     *
     * One pricing API call per cart item.
     *
     * Each request includes:
     *
     * eventDate
     * packageId
     */

    useEffect(() => {

        if (
            !isDisplayCartCheckout ||
            displayCart.length === 0
        ) {

            setCartItemPricing({});

            return;

        }


        const loadCartPricing =
            async () => {

                try {

                    setPricingLoading(
                        true
                    );


                    const pricingEntries =
                        await Promise.all(

                            displayCart.map(
                                async item => {

                                    try {

                                        /*
                                         * Event date must exist
                                         * for pricing calculation.
                                         */

                                        if (
                                            !item.eventDate
                                        ) {

                                            return null;

                                        }


                                        const response =
                                            await api.get<PricingCalculationResult>(
                                                `/pricing/services/${item.serviceId}/calculate`,
                                                {
                                                    params: {

                                                        eventDate:
                                                            item.eventDate,

                                                        packageId:
                                                            item.packageId ||
                                                            undefined

                                                    }
                                                }
                                            );


                                        return {

                                            serviceId:
                                                item.serviceId,

                                            pricing:
                                                response.data

                                        };

                                    }
                                    catch (error) {

                                        console.error(
                                            `Failed to load pricing for ${item.serviceName}:`,
                                            error
                                        );


                                        return null;

                                    }

                                }
                            )

                        );


                    const pricingMap:
                        Record<
                            string,
                            CartItemPricing
                        > = {};


                    pricingEntries.forEach(
                        entry => {

                            if (!entry) {

                                return;

                            }


                            pricingMap[
                                entry.serviceId
                            ] =
                                entry.pricing;

                        }
                    );


                    setCartItemPricing(
                        pricingMap
                    );

                }
                catch (error) {

                    console.error(
                        "Failed to load cart item pricing:",
                        error
                    );


                    toast.error(
                        "Unable to load current pricing."
                    );

                }
                finally {

                    setPricingLoading(
                        false
                    );

                }

            };


        loadCartPricing();

    }, [
        displayCart,
        isDisplayCartCheckout
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
        displayCart.length === 0
    ) {

        return (

            <section className="checkout-section" style={{ padding: "56px 16px 72px", minHeight: "52vh", background: "#f7f9fc" }}>

                <div className="container" style={{ maxWidth: 760, margin: "0 auto" }}>

                    <div style={{ background: "#fff", border: "1px solid #e5eaf1", borderRadius: 18, padding: "clamp(24px, 5vw, 42px)", textAlign: "center", boxShadow: "0 12px 32px rgba(20, 43, 74, 0.07)" }}>

                        <div aria-hidden="true" style={{ width: 64, height: 64, margin: "0 auto 18px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#fff4e5", color: "#a85d00", fontSize: 30 }}>!</div>

                        <h2 style={{ margin: "0 0 12px", color: "#142b4a", fontSize: "clamp(22px, 3vw, 30px)" }}>
                            Your booking hold has expired
                        </h2>

                        <p style={{ margin: "0 auto 12px", maxWidth: 560, color: "#526176", lineHeight: 1.65 }}>
                            The time slot you selected was held temporarily, and your hold is no longer valid. Another customer may have reserved it.
                        </p>

                        <p style={{ margin: "0 auto 26px", maxWidth: 560, color: "#526176", lineHeight: 1.65 }}>
                            Please return to your cart, choose the service, date and time again, and add it to your cart to continue. Other available services can be selected again as needed.
                        </p>

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate("/cart", { replace: true })}
                            style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", minHeight: 48, minWidth: 190, padding: "12px 24px", border: 0, borderRadius: 10, background: "#f4b323", color: "#142b4a", fontWeight: 700, cursor: "pointer" }}
                        >
                            ← Return to Cart
                        </button>

                        <p style={{ margin: "18px 0 0", color: "#7b8797", fontSize: 13 }}>
                            No booking has been submitted for the expired hold.
                        </p>

                    </div>

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

            console.log(
                "========== HANDLE SUBMIT =========="
            );


            console.log(
                "isCartCheckout:",
                isCartCheckout
            );


            console.log(
                "eventType:",
                eventType
            );


            console.log(
                "cart:",
                displayCart
            );


            if (
                submitting
            ) {

                return;

            }


            /*
             * =========================================
             * EVENT TYPE VALIDATION
             * =========================================
             */

            if (
                !eventType.trim()
            ) {

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

            if (
                isCartCheckout
            ) {

                try {

                    setSubmitting(
                        true
                    );


                    const bundleMap =
                        new Map<
                            string,
                            BookingBundleItemRequest
                        >();


                    const serviceRequests:
                        BookingServiceItemRequest[] = [];


                    displayCart.forEach(
                        item => {

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


                                if (
                                    !bundleRequest
                                ) {

                                    bundleRequest = {

                                        bundleId:
                                            item.bundleId,

                                        items:
                                            []

                                    };


                                    bundleMap.set(
                                        item.bundleId,
                                        bundleRequest
                                    );

                                }


                                bundleRequest.items.push({

                                    serviceId:
                                        item.serviceId,

                                    slotId:
                                        item.slotId || "",

                                    packageId:
                                        item.packageId,

                                    eventDate:
                                        item.eventDate || "",

                                    guestCount:
                                        Number(
                                            item.guestCount
                                        ),

                                    selectedCateringDishes:
                                        item.selectedCateringDishes?.map(dish => ({
                                            dishId: dish.dishId ?? dish.id,
                                            menuItemId: dish.menuItemId,
                                            name: dish.name,
                                            category: dish.category,
                                            foodType: dish.foodType,
                                            custom: dish.custom
                                        }))
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

                                slotId:
                                    item.slotId || "",

                                packageId:
                                    item.packageId,

                                eventDate:
                                    item.eventDate || "",

                                guestCount:
                                    Number(
                                        item.guestCount
                                    ),

                                selectedCateringDishes:
                                    item.selectedCateringDishes?.map(dish => ({
                                        dishId: dish.dishId ?? dish.id,
                                        menuItemId: dish.menuItemId,
                                        name: dish.name,
                                        category: dish.category,
                                        foodType: dish.foodType,
                                        custom: dish.custom
                                    }))
                            });

                        }
                    );


                    /*
                     * Convert Map to array.
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
                        await api.post<BundleBookingResponse>(
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
                        "Booking request submitted successfully!"
                    );


                    /*
                     * =========================================
                     * CONFIRMATION
                     * =========================================
                     */

                    if (
                        booking?.bookingGroupId
                    ) {

                        navigate(
                            `/booking-confirmation/${booking.bookingGroupId}`,
                            {
                                state: {
                                    booking
                                }
                            }
                        );

                    }
                    else {

                        toast.error(
                            "Booking created, but booking group ID was not returned."
                        );

                    }

                }
                catch (
                err: any
                ) {

                    console.error(
                        "========== BOOKING CREATION FAILED =========="
                    );


                    console.error(
                        err
                    );


                    console.error(
                        err?.response?.data
                    );


                    const responseData =
                        err?.response?.data;

                    const isExpiredHold =
                        responseData?.code ===
                        "BOOKING_HOLD_EXPIRED";

                    if (isExpiredHold) {

                        const expiredServiceId =
                            responseData?.serviceId;

                        const expiredSlotId =
                            responseData?.slotId;

                        const expiredEventDate =
                            responseData?.eventDate;

                        console.warn(
                            "Expired booking hold detected:",
                            {
                                serviceId:
                                    expiredServiceId,

                                slotId:
                                    expiredSlotId,

                                eventDate:
                                    expiredEventDate
                            }
                        );

                        /*
                         * Remove ONLY the expired item.
                         *
                         * Other cart items remain untouched.
                         */
                        const expiredItem =
                            displayCart.find(
                                item =>
                                    item.serviceId ===
                                    expiredServiceId
                                    &&
                                    item.slotId ===
                                    expiredSlotId
                                    &&
                                    item.eventDate ===
                                    expiredEventDate
                            );

                        if (expiredItem) {

                            let updatedCart: CartItem[];

                            /*
                             * Preserve the existing bundle
                             * behavior.
                             */
                            if (
                                expiredItem.bundleId
                            ) {

                                updatedCart =
                                    await CartService.removeItemFromBundle(
                                        expiredItem.serviceId,
                                        expiredItem.bundleId
                                    );

                            }
                            else {

                                updatedCart =
                                    await CartService.removeItem(
                                        expiredItem.serviceId
                                    );

                            }

                            setCurrentCart(
                                updatedCart
                            );

                            toast.error(
                                "Your selected time slot has expired. " +
                                "That item was removed from your cart. " +
                                "Please select the slot again."
                            );

                        }
                        else {

                            /*
                             * Defensive fallback.
                             *
                             * We received an expired hold from
                             * the backend but could not match it
                             * to the current local cart.
                             */
                            console.warn(
                                "Expired hold could not be matched to cart item.",
                                responseData
                            );

                            toast.error(
                                "Your selected time slot has expired. " +
                                "Please return to the cart and select the slot again."
                            );

                        }

                    }
                    else {

                        const message =
                            responseData?.message ||
                            "Unable to submit booking request. Please try again.";

                        toast.error(
                            message
                        );
                    }

                }
                finally {

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

            try {

                setSubmitting(
                    true
                );


                const bookingRequest:
                    CreateBookingRequest = {

                    bundles: [],

                    services: [

                        {

                            serviceId,
                            slotId:
                               state?.slotId ?? "",

                            packageId,

                            eventDate,

                            guestCount:
                                Number(
                                    guests
                                ),

                            selectedCateringDishes:
                                state?.selectedCateringDishes
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
                    await api.post<BundleBookingResponse>(
                        "/bookings",
                        bookingRequest
                    );


                const booking =
                    response.data;


                toast.success(
                    "Booking request submitted successfully!"
                );


                if (
                    booking?.bookingGroupId
                ) {

                    navigate(
                        `/booking-confirmation/${booking.bookingGroupId}`,
                        {
                            state: {
                                booking
                            }
                        }
                    );

                }
                else {

                    toast.error(
                        "Booking created, but booking group ID was not returned."
                    );

                }

            }
            catch (
            err: any
            ) {

                console.error(
                    "========== DIRECT BOOKING FAILED =========="
                );


                console.error(
                    err
                );


                console.error(
                    err?.response?.data
                );


                const responseData =
                    err?.response?.data;

                const isExpiredHold =
                    responseData?.code ===
                    "BOOKING_HOLD_EXPIRED";

                if (isExpiredHold) {

                    const expiredServiceId =
                        responseData?.serviceId;

                    const expiredSlotId =
                        responseData?.slotId;

                    const expiredEventDate =
                        responseData?.eventDate;

                    console.warn(
                        "Expired booking hold detected:",
                        {
                            serviceId:
                                expiredServiceId,

                            slotId:
                                expiredSlotId,

                            eventDate:
                                expiredEventDate
                        }
                    );

                    /*
                     * Remove ONLY the expired item.
                     *
                     * Other cart items remain untouched.
                     */
                    const expiredItem =
                        displayCart.find(
                            item =>
                                item.serviceId ===
                                expiredServiceId
                                &&
                                item.slotId ===
                                expiredSlotId
                                &&
                                item.eventDate ===
                                expiredEventDate
                        );

                    if (expiredItem) {

                        let updatedCart: CartItem[];

                        /*
                         * Preserve the existing bundle
                         * behavior.
                         */
                        if (
                            expiredItem.bundleId
                        ) {

                            updatedCart =
                                await CartService.removeItemFromBundle(
                                    expiredItem.serviceId,
                                    expiredItem.bundleId
                                );

                        }
                        else {

                            updatedCart =
                                await CartService.removeItem(
                                    expiredItem.serviceId
                                );

                        }

                        setCurrentCart(
                            updatedCart
                        );

                        toast.error(
                            "Your selected time slot has expired. " +
                            "That item was removed from your cart. " +
                            "Please select the slot again."
                        );

                    }
                    else {

                        /*
                         * Defensive fallback.
                         *
                         * We received an expired hold from
                         * the backend but could not match it
                         * to the current local cart.
                         */
                        console.warn(
                            "Expired hold could not be matched to cart item.",
                            responseData
                        );

                        toast.error(
                            "Your selected time slot has expired. " +
                            "Please return to the cart and select the slot again."
                        );

                    }

                }
                else {

                    const message =
                        responseData?.message ||
                        "Unable to submit booking request. Please try again.";

                    toast.error(
                        message
                    );
                }

            }
            finally {

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

                    {
                        isCartCheckout
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

                        {
                            isCartCheckout && (

                                <div className="checkout-card">

                                    <h2>
                                        Selected Services
                                    </h2>


                                    <p className="selected-services-subtitle">
                                        Services selected for this checkout.
                                    </p>


                                    <div className="checkout-cart-items">

                                        {
                                            displayCart.map(
                                                item => {

                                                    const bundleItem =
                                                        bundlePricing?.items?.find(
                                                            bundle =>
                                                                bundle.serviceId ===
                                                                item.serviceId
                                                        );


                                                    const itemPricing =
                                                        cartItemPricing[
                                                        item.serviceId
                                                        ];


                                                    const originalAmount =
                                                        bundleItem?.originalAmount ??
                                                        itemPricing?.subtotal ??
                                                        Number(
                                                            item.price
                                                        );


                                                    const finalAmount =
                                                        bundleItem?.finalAmount ??
                                                        itemPricing?.totalAmount ??
                                                        Number(
                                                            item.price
                                                        );


                                                    const discountAmount =
                                                        bundleItem?.discountAmount ??
                                                        0;


                                                    return (

                                                        <div
                                                            key={
                                                                item.serviceId
                                                            }
                                                            className="checkout-cart-item"
                                                        >

                                                            {/* =================================
                                                                FIRST ROW
                                                            ================================= */}

                                                            <div className="checkout-service-first-row">


                                                                {/* SERVICE INFORMATION */}

                                                                <div className="checkout-service-info">

                                                                    <strong className="checkout-service-name">
                                                                        {
                                                                            item.serviceName
                                                                        }
                                                                    </strong>


                                                                    {
                                                                        item.vendorName && (

                                                                            <span className="checkout-service-vendor">
                                                                                {
                                                                                    item.vendorName
                                                                                }
                                                                            </span>

                                                                        )
                                                                    }


                                                                    {
                                                                        item.category && (

                                                                            <span className="checkout-service-category">
                                                                                {
                                                                                    item.category
                                                                                }
                                                                            </span>

                                                                        )
                                                                    }


                                                                    {
                                                                        item.packageType && (

                                                                            <span className="checkout-service-category">
                                                                                {
                                                                                    item.packageType
                                                                                }{" "}
                                                                                Package
                                                                            </span>

                                                                        )
                                                                    }

                                                                </div>


                                                                {/* EVENT DATE */}

                                                                <div className="checkout-service-event-date">

                                                                    <strong>
                                                                        Event Date:
                                                                    </strong>{" "}

                                                                    {
                                                                        item.eventDate ||
                                                                        "Not Selected"
                                                                    }

                                                                </div>


                                                                {/* GUESTS */}

                                                                <div className="checkout-service-guests">

                                                                    <strong>
                                                                        Guests:
                                                                    </strong>{" "}

                                                                    {
                                                                        item.guestCount ||
                                                                        0
                                                                    }

                                                                </div>


                                                                {/* DELETE */}

                                                                <button
                                                                    type="button"
                                                                    className="remove-service-button"
                                                                    onClick={() =>
                                                                        handleRemoveService(
                                                                            item
                                                                        )
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

                                                                        {
                                                                            formatCurrency(
                                                                                finalAmount
                                                                            )
                                                                        }

                                                                    </span>


                                                                    <span className="original-price">

                                                                        <strong>
                                                                            Original:
                                                                        </strong>{" "}

                                                                        {
                                                                            formatCurrency(
                                                                                originalAmount
                                                                            )
                                                                        }

                                                                    </span>


                                                                    {
                                                                        discountAmount > 0 && (

                                                                            <span className="service-bundle-discount">

                                                                                <strong>
                                                                                    Bundle Discount:
                                                                                </strong>{" "}

                                                                                -

                                                                                {
                                                                                    formatCurrency(
                                                                                        discountAmount
                                                                                    )
                                                                                }

                                                                            </span>

                                                                        )
                                                                    }

                                                                </div>

                                                            </div>


                                                            {/* =================================
                                                                PRICING DETAILS
                                                            ================================= */}

                                                            {
                                                                itemPricing && (

                                                                    <div className="checkout-service-pricing-details">


                                                                        {/* BASE AMOUNT */}

                                                                        <div className="checkout-pricing-row">

                                                                            <span>
                                                                                Base Amount
                                                                            </span>


                                                                            <strong>
                                                                                {
                                                                                    formatCurrency(
                                                                                        itemPricing.baseAmount
                                                                                    )
                                                                                }
                                                                            </strong>

                                                                        </div>


                                                                        {/* PRICING HEADS */}

                                                                        {
                                                                            itemPricing.pricingHeads.map(
                                                                                head => (

                                                                                    <div
                                                                                        className="checkout-pricing-row"
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
                                                                            )
                                                                        }


                                                                        {/* NORMAL DISCOUNTS */}

                                                                        {
                                                                            itemPricing.discounts.map(
                                                                                (
                                                                                    discount,
                                                                                    index
                                                                                ) => (

                                                                                    <div
                                                                                        className="checkout-pricing-row discount-row"
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
                                                                            )
                                                                        }


                                                                        {/* SUBTOTAL */}

                                                                        <div className="checkout-pricing-row">

                                                                            <span>
                                                                                Subtotal
                                                                            </span>


                                                                            <strong>
                                                                                {
                                                                                    formatCurrency(
                                                                                        itemPricing.subtotal
                                                                                    )
                                                                                }
                                                                            </strong>

                                                                        </div>


                                                                    </div>

                                                                )
                                                            }

                                                        </div>

                                                    );

                                                }
                                            )
                                        }


                                        {/* =================================
                                            TOTAL BUNDLE DISCOUNT
                                        ================================= */}

                                        {
                                            bundleDiscount > 0 && (

                                                <div className="total-bundle-discount-row">

                                                    <span>
                                                        Total Bundle Discount
                                                    </span>


                                                    <strong>
                                                        -
                                                        {
                                                            formatCurrency(
                                                                bundleDiscount
                                                            )
                                                        }
                                                    </strong>

                                                </div>

                                            )
                                        }

                                    </div>

                                </div>

                            )
                        }


                        {/* =================================
                            BOOKING SUMMARY
                        ================================= */}

                        {
                            !isCartCheckout &&
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

                            )
                        }


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

                            {
                                isCartCheckout ? (

                                    <>

                                        <h3>
                                            Order Summary
                                        </h3>


                                        <p>
                                            {
                                                displayCart.length
                                            }{" "}
                                            service
                                            {
                                                displayCart.length !== 1
                                                    ? "s"
                                                    : ""
                                            }
                                        </p>


                                        <hr />


                                        {
                                            displayCart.map(
                                                item => {

                                                    const itemDiscount =
                                                        localBundleDiscounts.get(
                                                            item.serviceId
                                                        ) ??
                                                        0;


                                                    const itemPricing =
                                                        cartItemPricing[
                                                        item.serviceId
                                                        ];


                                                    const itemOriginalPrice =
                                                        Number(
                                                            itemPricing?.subtotal ??
                                                            item.price
                                                        );


                                                    const itemFinalPrice =
                                                        Math.max(
                                                            0,
                                                            itemOriginalPrice -
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
                                            )
                                        }


                                        <hr />


                                        {/* =================================
                                            ORIGINAL TOTAL
                                        ================================= */}

                                        <div className="summary-row">

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
                                            BUNDLE DISCOUNT
                                        ================================= */}

                                        {
                                            localTotalBundleDiscount > 0 && (

                                                <div className="summary-row discount-row">

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

                                            )
                                        }


                                        <hr />


                                        {/* =================================
                                            FINAL TOTAL
                                        ================================= */}

                                        <div className="summary-row total">

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


                                        {
                                            localTotalBundleDiscount <= 0 && (

                                                <p className="payment-message">

                                                    No bundle discount applies
                                                    to the selected services.

                                                </p>

                                            )
                                        }

                                    </>

                                ) : (

                                    <>

                                        {
                                            vendor?.imageUrl && (

                                                <img
                                                    src={
                                                        vendor.imageUrl
                                                    }
                                                    alt={
                                                        vendor.businessName
                                                    }
                                                />

                                            )
                                        }


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


                                        {
                                            pricingLoading && (

                                                <div className="pricing-loading">

                                                    Loading current pricing...

                                                </div>

                                            )
                                        }


                                        {
                                            !pricingLoading &&
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

                                            )
                                        }


                                        {
                                            !pricingLoading &&
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


                                                    {
                                                        pricingHeads.map(
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
                                                        )
                                                    }


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


                                                    {
                                                        discounts.map(
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
                                                        )
                                                    }


                                                    {
                                                        discountAmount > 0 && (

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

                                                        )
                                                    }


                                                    <hr />


                                                    <div className="summary-row total">

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


                                                    {
                                                        advanceAmount > 0 && (

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

                                                        )
                                                    }


                                                    {
                                                        advanceAmount > 0 && (

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

                                                        )
                                                    }

                                                </>

                                            )
                                        }

                                    </>

                                )
                            }


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
                                    onClick={
                                        handleSubmit
                                    }
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
