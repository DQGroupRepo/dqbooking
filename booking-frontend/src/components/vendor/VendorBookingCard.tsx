import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

import type { VendorDetail } from "../../types/VendorDetail";
import type { Bundle } from "../../types/Bundle";
import type { ServicePackage } from "../../types/ServicePackage";
import type { CartItem } from "../../types/CartItem";

import CartService from "../../services/CartService";
import VendorDetailService from "../../services/VendorDetailService";

import BookingAvailabilityService from "../../services/BookingAvailabilityService";
import type { SlotAvailability } from "../../types/SlotAvailability";

import "./VendorBookingCard.css";


interface Props {

    vendor: VendorDetail;

    serviceId?: string;

    bundles?: Bundle[];

    selectedPackage?: ServicePackage | null;

    onEventDateChange?: (
        date: string
    ) => void;
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
    bundles = [],
    selectedPackage,
    onEventDateChange
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
     * BOOKING SLOT
     * =========================================
     */

    const [slots, setSlots] =
        useState<SlotAvailability[]>([]);


    const [selectedSlot, setSelectedSlot] =
        useState<SlotAvailability | null>(null);


    const [slotsLoading, setSlotsLoading] =
        useState(false);


    const [slotError, setSlotError] =
        useState<string | null>(null);


    const [holdingSlot, setHoldingSlot] =
        useState(false);


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
     * LOAD SLOT AVAILABILITY
     * =========================================
     */

    const loadSlotAvailability = async (
        date: string
    ) => {

        if (!serviceId || !date) {

            setSlots([]);

            setSelectedSlot(null);

            return;
        }


        try {

            setSlotsLoading(true);

            setSlotError(null);

            /*
             * A slot from another date must never
             * remain selected.
             */
            setSelectedSlot(null);


            console.log(
                "Loading slot availability:",
                {
                    serviceId,
                    date
                }
            );


            const data =
                await BookingAvailabilityService
                    .getSlotAvailability(
                        serviceId,
                        date
                    );


            console.log(
                "Slot availability loaded:",
                data
            );


            setSlots(
                data ?? []
            );

        } catch (error) {

            console.error(
                "Failed to load slot availability:",
                error
            );


            setSlots([]);

            setSelectedSlot(null);


            setSlotError(
                "Unable to load booking slots. Please try again."
            );

        } finally {

            setSlotsLoading(false);

        }

    };


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


            if (!selectedSlot) {

                alert(
                    "Please select an available time slot."
                );

                return false;

            }


            if (!selectedSlot.available) {

                alert(
                    "The selected slot is no longer available. Please select another slot."
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
     * GET VENDOR IMAGE
     * =========================================
     */

    const getVendorImage =
        (
            service: VendorDetail
        ): string | undefined => {

            return service.imageUrls?.[0];

        };


    /*
     * =========================================
     * ADD CURRENT SERVICE TO CART
     * =========================================
     *
     * Important:
     *
     * The temporary hold is created BEFORE the
     * cart item is stored.
     *
     * This prevents two customers from adding
     * the last available unit simultaneously.
     */

    const addCurrentServiceToCart =
        async (
            bundle?: Bundle
        ) => {

            if (!serviceId) {
                return false;
            }


            if (!eventDate) {

                alert(
                    "Please select an event date."
                );

                return false;

            }


            if (!selectedSlot) {

                alert(
                    "Please select an available time slot."
                );

                return false;

            }


            if (!selectedSlot.available) {

                alert(
                    "This slot is no longer available. Please select another slot."
                );

                return false;

            }


            /*
             * One cart item consumes one booking
             * availability unit.
             *
             * Guest count is NOT treated as multiple
             * slot bookings.
             */
            const quantity = 1;
            const cartId =
                CartService.getOrCreateCartId();

            /*
             * =========================================
             * CREATE TEMPORARY HOLD
             * =========================================
             */

            try {

                setHoldingSlot(true);


                console.log(
                    "Creating booking hold:",
                    {
                        cartId,
                        serviceId,
                        slotId:
                            selectedSlot.slotId,
                        eventDate,
                        quantity
                    }
                );


                const hold =
                    await BookingAvailabilityService
                        .holdSlot({
                            cartId,
                            serviceId,
                            slotId:
                                selectedSlot.slotId,
                            eventDate,
                            quantity
                        });


                console.log(
                    "Booking hold created:",
                    hold
                );


                /*
                 * =========================================
                 * CREATE CART ITEM
                 * =========================================
                 */

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
                        selectedPackage
                            ? Number(
                                selectedPackage.price
                            )
                            : Number(
                                vendor.startingPrice
                            ),

                    quantity,

                    image:
                        getVendorImage(
                            vendor
                        ),

                    eventDate,

                    guestCount:
                        Number(guests),


                    /*
                     * =========================================
                     * SLOT SNAPSHOT
                     * =========================================
                     */

                    slotId:
                        selectedSlot.slotId,

                    slotName:
                        selectedSlot.slotName,

                    slotStartTime:
                        selectedSlot.startTime,

                    slotEndTime:
                        selectedSlot.endTime,


                    /*
                     * =========================================
                     * HOLD
                     * =========================================
                     */

                    holdId:
                        hold.holdId,

                    holdExpiresAt:
                        hold.expiresAt,


                    /*
                     * =========================================
                     * PACKAGE
                     * =========================================
                     */

                    packageId:
                        selectedPackage?.id,

                    packageType:
                        selectedPackage?.name?.toUpperCase() === "SILVER"
                            ? "SILVER"
                            : selectedPackage?.name?.toUpperCase() === "GOLD"
                                ? "GOLD"
                                : selectedPackage?.name?.toUpperCase() === "PREMIUM"
                                    ? "PREMIUM"
                                    : undefined,

                    packagePrice:
                        selectedPackage
                            ? Number(
                                selectedPackage.price
                            )
                            : undefined,

                    packageFeatures:
                        selectedPackage?.features,


                    /*
                     * =========================================
                     * BUNDLE
                     * =========================================
                     */

                    bundleEnabled:
                        !!bundle,

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


                return true;

            } catch (error: any) {

                console.error(
                    "Failed to hold booking slot:",
                    error
                );

                if (error?.response?.status === 401) {

                    toast.error(
                        "Please login to continue booking"
                    );

                } else {

                    toast.error(
                        error?.response?.data?.message ||
                        "Failed to reserve the selected slot."
                    );

                }


                /*
                 * Refresh availability because
                 * another customer may have taken
                 * the last available unit.
                 */

                await loadSlotAvailability(
                    eventDate
                );


                return false;

            } finally {

                setHoldingSlot(false);

            }

        };


    /*
     * =========================================
     * GET CURRENT BUNDLE
     * =========================================
     */

    const getCurrentBundle =
        (): Bundle | undefined => {

            if (
                !fromBundle ||
                !bundleState?.bundleId
            ) {
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
        async () => {

            if (!validateBooking()) {
                return;
            }


            /*
             * If we are travelling through a bundle,
             * add this service to the same bundle.
             */

            if (fromBundle) {

                const currentBundle =
                    getCurrentBundle();


                const added =
                    await addCurrentServiceToCart(
                        currentBundle
                    );


                if (!added) {
                    return;
                }


                navigateToBundleSelection();

                return;

            }


            /*
             * Normal service booking.
             */

            const added =
                await addCurrentServiceToCart();


            if (!added) {
                return;
            }


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

            if (!selectedPackage) {
                return;
            }


            if (!validateBooking()) {
                return;
            }


            /*
             * If we came from the bundle page,
             * do NOT show the bundle popup again.
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
        async (
            bundle: Bundle
        ) => {

            if (!serviceId) {
                return;
            }


            const added =
                await addCurrentServiceToCart(
                    bundle
                );


            if (!added) {
                return;
            }


            setShowBundlePopup(
                false
            );


            navigate(
                `/bundles/available/${serviceId}`,
                {
                    state: {

                        fromBundle: true,

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
        async () => {

            const added =
                await addCurrentServiceToCart();


            if (!added) {
                return;
            }


            setShowBundlePopup(
                false
            );


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
                ]?.imageUrls?.[0]
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
                        selectedPackage
                            ? selectedPackage.price
                            : vendor.startingPrice
                    ).toLocaleString("en-IN")}
                </h2>


                <p className="selected-package-name">
                    {
                        selectedPackage
                            ? selectedPackage.name
                            : "Starting Price"
                    }
                </p>


                <p className="pricing-hint">
                    Select the event date to get the exact price.
                </p>


                <label>
                    Event Date
                </label>


                <input
                    type="date"
                    value={eventDate}
                    min={getTomorrowDate()}
                    onChange={async (e) => {

                        const date =
                            e.target.value;


                        setEventDate(
                            date
                        );


                        /*
                         * A slot selected for another
                         * date must never remain selected.
                         */

                        setSelectedSlot(
                            null
                        );


                        setSlots(
                            []
                        );


                        setSlotError(
                            null
                        );


                        onEventDateChange?.(
                            date
                        );


                        if (date) {

                            await loadSlotAvailability(
                                date
                            );

                        }

                    }}
                />


                {
                    eventDate && (
                        <>

                            <label className="slot-section-label">
                                Time Slot
                            </label>


                            {
                                slotsLoading ? (

                                    <div className="slot-loading">
                                        <span className="slot-loading-dot" />
                                        Loading booking slots...
                                    </div>

                                ) : slotError ? (

                                    <div className="slot-error">
                                        {slotError}
                                    </div>

                                ) : slots.length === 0 ? (

                                    <div className="slot-empty">
                                        No booking slots are configured for this service.
                                    </div>

                                ) : (

                                    /*
                                     * IMPORTANT:
                                     *
                                     * Every slot is rendered independently.
                                     *
                                     * We do NOT group by Morning / Evening
                                     * because a vendor can configure:
                                     *
                                     * Morning 09:00 - 10:00
                                     * Morning 10:00 - 11:00
                                     * Morning 11:00 - 12:00
                                     *
                                     * or any other combination.
                                     */

                                    <div className="booking-slots">

                                        {
                                            slots.map(
                                                slot => {

                                                    const isSelected =
                                                        selectedSlot?.slotId ===
                                                        slot.slotId;


                                                    const unavailable =
                                                        !slot.available;


                                                    return (

                                                        <button
                                                            key={
                                                                slot.slotId
                                                            }
                                                            type="button"
                                                            className={
                                                                `booking-slot-card ${
                                                                    isSelected
                                                                        ? "selected"
                                                                        : ""
                                                                } ${
                                                                    unavailable
                                                                        ? "unavailable"
                                                                        : ""
                                                                }`
                                                            }
                                                            disabled={
                                                                unavailable ||
                                                                holdingSlot
                                                            }
                                                            onClick={() => {

                                                                if (
                                                                    unavailable ||
                                                                    holdingSlot
                                                                ) {
                                                                    return;
                                                                }


                                                                setSelectedSlot(
                                                                    slot
                                                                );

                                                            }}
                                                        >

                                                            <div className="booking-slot-info">

                                                                <span className="booking-slot-name">
                                                                    {
                                                                        slot.slotName
                                                                    }
                                                                </span>


                                                                <span className="booking-slot-time">

                                                                    {
                                                                        slot.startTime
                                                                    }

                                                                    {" - "}

                                                                    {
                                                                        slot.endTime
                                                                    }

                                                                </span>

                                                            </div>


                                                            <div className="booking-slot-status">

                                                                {
                                                                    unavailable ? (

                                                                        <span className="booking-slot-unavailable-text">
                                                                            Not Available
                                                                        </span>

                                                                    ) : (

                                                                        <span className="booking-slot-availability">
                                                                            {
                                                                                slot.remainingCapacity
                                                                            }

                                                                            {" "}

                                                                            {
                                                                                Number(
                                                                                    slot.remainingCapacity
                                                                                ) === 1
                                                                                    ? "available"
                                                                                    : "available"
                                                                            }
                                                                        </span>

                                                                    )
                                                                }


                                                                <span
                                                                    className="booking-slot-radio"
                                                                    aria-hidden="true"
                                                                >
                                                                    {
                                                                        isSelected
                                                                            ? "✓"
                                                                            : ""
                                                                    }
                                                                </span>

                                                            </div>

                                                        </button>

                                                    );

                                                }
                                            )
                                        }

                                    </div>

                                )
                            }


                            {
                                selectedSlot && (
                                    <div className="selected-slot-summary">

                                        <span>
                                            Selected slot
                                        </span>


                                        <strong>
                                            {
                                                selectedSlot.slotName
                                            }
                                        </strong>


                                        <span>
                                            {
                                                selectedSlot.startTime
                                            }

                                            {" - "}

                                            {
                                                selectedSlot.endTime
                                            }
                                        </span>

                                    </div>
                                )
                            }

                        </>
                    )
                }


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
                    onClick={handleBooking}
                    disabled={
                        !selectedPackage ||
                        !selectedSlot ||
                        !selectedSlot.available ||
                        holdingSlot ||
                        slotsLoading
                    }
                >
                    {
                        holdingSlot
                            ? "Reserving..."
                            : "Add to Cart"
                    }
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