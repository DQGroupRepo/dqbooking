import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";

import type { VendorDetail } from "../../types/VendorDetail";
import type { Bundle } from "../../types/Bundle";

import CartService from "../../services/CartService";
import VendorDetailService from "../../services/VendorDetailService";

import "./VendorBookingCard.css";


interface Props {

    vendor: VendorDetail;

    serviceId?: string;

    bundles?: Bundle[];

    fromBundle?: boolean;

    bundleState?: any;

}


function getTomorrowDate(): string {

    const tomorrow = new Date();

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );

    return tomorrow
        .toISOString()
        .split("T")[0];

}


const BookingCard = ({
    vendor,
    serviceId,
    bundles = []
}: Props) => {

    const navigate =
        useNavigate();

    const location =
        useLocation();


    /*
     * =========================================
     * BUNDLE NAVIGATION STATE
     * =========================================
     */

    const bundleState =
        location.state as any;


    const fromBundle =
        bundleState?.fromBundle === true;


    /*
     * =========================================
     * BOOKING DETAILS
     * =========================================
     */

    const [eventDate, setEventDate] =
        useState("");


    const [guests, setGuests] =
        useState<number | string>("");


    /*
     * =========================================
     * BUNDLE POPUP
     * =========================================
     */

    const [showBundlePopup, setShowBundlePopup] =
        useState(false);


    /*
     * =========================================
     * SERVICES INSIDE BUNDLES
     * =========================================
     *
     * Key   = serviceId
     * Value = VendorDetail
     */

    const [bundleServices, setBundleServices] =
        useState<
            Record<string, VendorDetail>
        >({});


    /*
     * =========================================
     * OPEN BUNDLE POPUP WHEN REQUESTED
     * =========================================
     *
     * This is used when the customer clicks
     * "Switch Bundle" from the bundle page.
     *
     * It should NOT happen during a normal
     * visit to the service details page.
     */

    useEffect(() => {

        if (
            bundleState?.openBundlePopup === true &&
            bundles.length > 0
        ) {

            setShowBundlePopup(
                true
            );

        }

    }, [
        bundleState,
        bundles
    ]);


    /*
     * =========================================
     * LOAD BUNDLE SERVICE DETAILS
     * =========================================
     *
     * We load the names/images of services
     * displayed inside the bundle popup.
     */

    useEffect(() => {

        if (
            !showBundlePopup ||
            bundles.length === 0
        ) {
            return;
        }


        const serviceIds =
            Array.from(
                new Set(
                    bundles.flatMap(
                        bundle =>
                            bundle.serviceIds
                    )
                )
            );


        const loadBundleServices =
            async () => {

                try {

                    const results =
                        await Promise.all(

                            serviceIds.map(
                                async id => {

                                    try {

                                        const service =
                                            await VendorDetailService
                                                .getById(
                                                    id
                                                );

                                        return {
                                            id,
                                            service
                                        };

                                    } catch (error) {

                                        console.error(
                                            `Failed to load bundle service ${id}:`,
                                            error
                                        );

                                        return null;

                                    }

                                }
                            )

                        );


                    const serviceMap:
                        Record<
                            string,
                            VendorDetail
                        > = {};


                    results.forEach(
                        result => {

                            if (result) {

                                serviceMap[
                                    result.id
                                ] =
                                    result.service;

                            }

                        }
                    );


                    setBundleServices(
                        serviceMap
                    );

                } catch (error) {

                    console.error(
                        "Failed to load bundle services:",
                        error
                    );

                }

            };


        loadBundleServices();

    }, [
        showBundlePopup,
        bundles
    ]);


    /*
     * =========================================
     * VALIDATE BOOKING DETAILS
     * =========================================
     */

    const validateBooking =
        (): boolean => {

            if (!serviceId) {

                alert(
                    "Unable to identify the selected service."
                );

                return false;

            }


            if (!eventDate) {

                alert(
                    "Please select an event date."
                );

                return false;

            }


            if (
                !guests ||
                Number(guests) < 1
            ) {

                alert(
                    "Please enter a valid guest count."
                );

                return false;

            }


            return true;

        };


    /*
     * =========================================
     * ADD CURRENT SERVICE TO CART
     * =========================================
     */

    const addCurrentServiceToCart =
        (bundle?: Bundle) => {

            if (!serviceId) {
                return;
            }


            const cartItem: CartItem = {

                serviceId,

                vendorId:
                    vendor.vendorId,

                vendorName:
                    vendor.businessName,

                serviceName:
                    vendor.serviceName,

                category:
                    vendor.category,

                price:
                    Number(
                        vendor.startingPrice
                    ),

                quantity: 1,

                image:
                    vendor.image,

                eventDate,

                guestCount:
                    Number(guests),

                bundleEnabled:
                    !!bundle,

                /*
                 * =========================================
                 * BUNDLE INFORMATION
                 * =========================================
                 */

                bundleId:
                    bundle?.id,

                bundleName:
                    bundle?.name,

                bundleDescription:
                    bundle?.description,

                bundleServiceIds:
                    bundle?.serviceIds,

                bundleDiscountType:
                    bundle?.discountType,

                bundleDiscountValue:
                    bundle?.discountValue

            };


            CartService.addItem(
                cartItem
            );

        };

    const getCurrentBundle = (): Bundle | undefined => {

        if (!fromBundle || !bundleState?.bundleId) {
            return undefined;
        }


        return {

            id:
                bundleState.bundleId,

            vendorId:
                "",

            name:
                bundleState.bundleName ||
                "Selected Bundle",

            description:
                bundleState.bundleDescription,

            serviceIds:
                bundleState.bundleServiceIds ||
                [],

            discountType:
                bundleState.bundleDiscountType ||
                "PERCENTAGE",

            discountValue:
                bundleState.bundleDiscountValue ||
                0,

            active: true

        };

    };
    /*
     * =========================================
     * NORMAL BOOKING
     * =========================================
     */

    const handleNormalBooking =
        () => {

            if (!validateBooking()) {
                return;
            }


            /*
             * If we are travelling through a bundle,
             * add this service to the SAME bundle.
             *
             * This is important for the second,
             * third, etc. services.
             */

            if (fromBundle) {

                const currentBundle =
                    getCurrentBundle();


                addCurrentServiceToCart(
                    currentBundle
                );


                navigateToBundleSelection();

                return;

            }


            /*
             * Normal service booking.
             */

            addCurrentServiceToCart();


            navigate(
                "/cart"
            );

        };


    /*
     * =========================================
     * RETURN TO BUNDLE SELECTION
     * =========================================
     */

    const navigateToBundleSelection =
        () => {

            const rootServiceId =
                bundleState?.bundleRootServiceId;


            if (!rootServiceId) {

                navigate(
                    "/cart"
                );

                return;

            }


            navigate(
                `/bundles/available/${rootServiceId}`,
                {
                    state: bundleState
                }
            );

        };


    /*
     * =========================================
     * ADD TO CART / BOOK
     * =========================================
     */

    const handleBooking =
        () => {

            if (!validateBooking()) {
                return;
            }


            /*
             * If we came from the bundle page,
             * do NOT show the bundle popup again.
             *
             * Simply add the current service and
             * return to the bundle page.
             */

            if (fromBundle) {

                handleNormalBooking();

                return;

            }


            /*
             * Normal service page.
             *
             * If bundle offers exist, show popup.
             */

            if (
                bundles.length > 0
            ) {

                setShowBundlePopup(
                    true
                );

                return;

            }


            /*
             * No bundle available.
             */

            handleNormalBooking();

        };


    /*
     * =========================================
     * CUSTOMER ACCEPTS BUNDLE
     * =========================================
     */

    const handleAcceptBundle =
        (bundle: Bundle) => {

            if (!serviceId) {
                return;
            }


            /*
             * Add the currently selected service
             * to the cart first.
             */
            addCurrentServiceToCart(
                bundle
            );


            setShowBundlePopup(false);


            /*
             * =========================================
             * GO TO SELECTED BUNDLE PAGE
             * =========================================
             *
             * IMPORTANT:
             *
             * Do NOT navigate directly to the next
             * service here.
             *
             * The bundle page is now responsible for
             * showing the remaining services and allowing
             * the customer to choose which one to open.
             */

            navigate(
                `/bundles/available/${serviceId}`,
                {
                    state: {

                        fromBundle: true,

                        /*
                         * The service which originally
                         * started this bundle.
                         */
                        bundleRootServiceId:
                            serviceId,

                        bundleId:
                            bundle.id,

                        bundleName:
                            bundle.name,

                        bundleDescription:
                            bundle.description,

                        bundleServiceIds:
                            bundle.serviceIds,

                        bundleDiscountType:
                            bundle.discountType,

                        bundleDiscountValue:
                            bundle.discountValue

                    }
                }
            );

        };


    /*
     * =========================================
     * CUSTOMER DECLINES BUNDLE
     * =========================================
     */

    const handleDeclineBundle =
        () => {

            setShowBundlePopup(
                false
            );


            addCurrentServiceToCart();


            navigate(
                "/cart"
            );

        };


    /*
     * =========================================
     * GET SERVICE NAME
     * =========================================
     */

    const getBundleServiceName =
        (
            bundleServiceId: string
        ): string => {

            return (
                bundleServices[
                    bundleServiceId
                ]?.serviceName
                ||
                "Service"
            );

        };


    /*
     * =========================================
     * GET SERVICE IMAGE
     * =========================================
     */

    const getBundleServiceImage =
        (
            bundleServiceId: string
        ): string | undefined => {

            return (
                bundleServices[
                    bundleServiceId
                ]?.image
            );

        };


    /*
     * =========================================
     * UI
     * =========================================
     */

    return (

        <>

            <aside className="vendor-booking-card">

                <h2>

                    ₹
                    {Number(
                        vendor.startingPrice
                    ).toLocaleString(
                        "en-IN"
                    )}

                </h2>


                <p>
                    Starting Price
                </p>


                <label>
                    Event Date
                </label>


                <input
                    type="date"
                    value={eventDate}
                    min={getTomorrowDate()}
                    onChange={(e) =>
                        setEventDate(
                            e.target.value
                        )
                    }
                />


                <label>
                    Guests
                </label>


                <input
                    type="number"
                    min="1"
                    value={guests}
                    onChange={(e) =>
                        setGuests(
                            e.target.value
                        )
                    }
                    placeholder="Enter number of guests"
                />


                <button
                    className="book-button"
                    type="button"
                    onClick={
                        handleBooking
                    }
                >
                    Add to Cart
                </button>


                <button
                    className="save-button"
                    type="button"
                >
                    ♡ Save Vendor
                </button>

            </aside>


            {/* =========================================
                BUNDLE POPUP
               ========================================= */}

            {
                showBundlePopup &&
                bundles.length > 0 && (

                    <div className="bundle-modal-overlay">

                        <div className="bundle-modal">

                            <h2>
                                Bundle Offer Available
                            </h2>


                            <p>
                                This service is available
                                as part of:
                            </p>


                            {
                                bundles.map(
                                    bundle => (

                                        <div
                                            className="bundle-offer"
                                            key={
                                                bundle.id
                                            }
                                        >

                                            <h3>
                                                {
                                                    bundle.name
                                                }
                                            </h3>


                                            {
                                                bundle.description && (

                                                    <p>
                                                        {
                                                            bundle.description
                                                        }
                                                    </p>

                                                )
                                            }


                                            <strong>

                                                Save{" "}

                                                {
                                                    bundle.discountType ===
                                                    "PERCENTAGE"

                                                        ? `${bundle.discountValue}%`

                                                        : `₹${Number(
                                                            bundle.discountValue
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}`

                                                }

                                            </strong>


                                            {/* =====================================
                                                SERVICES IN BUNDLE
                                               ===================================== */}

                                            <div className="bundle-services">

                                                {
                                                    bundle.serviceIds.map(
                                                        bundleServiceId => {

                                                            const image =
                                                                getBundleServiceImage(
                                                                    bundleServiceId
                                                                );


                                                            return (

                                                                <div
                                                                    className="bundle-service-item"
                                                                    key={
                                                                        bundleServiceId
                                                                    }
                                                                >

                                                                    <div className="bundle-service-image">

                                                                        {
                                                                            image
                                                                                ? (

                                                                                    <img
                                                                                        src={
                                                                                            image
                                                                                        }
                                                                                        alt={
                                                                                            getBundleServiceName(
                                                                                                bundleServiceId
                                                                                            )
                                                                                        }
                                                                                    />

                                                                                )
                                                                                : (

                                                                                    <div className="bundle-service-image-placeholder">

                                                                                        📦

                                                                                    </div>

                                                                                )
                                                                        }

                                                                    </div>


                                                                    <span>

                                                                        {
                                                                            getBundleServiceName(
                                                                                bundleServiceId
                                                                            )
                                                                        }

                                                                    </span>

                                                                </div>

                                                            );

                                                        }
                                                    )
                                                }

                                            </div>


                                            <p>

                                                This bundle contains{" "}

                                                {
                                                    bundle.serviceIds.length
                                                }{" "}

                                                services.

                                            </p>


                                            <div className="bundle-modal-actions">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAcceptBundle(
                                                            bundle
                                                        )
                                                    }
                                                >
                                                    Yes, use this bundle
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleDeclineBundle
                                                    }
                                                >
                                                    No, continue normally
                                                </button>

                                            </div>

                                        </div>

                                    )
                                )
                            }

                        </div>

                    </div>

                )
            }

        </>

    );

};


export default BookingCard;