import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

import type { VendorDetail } from "../../types/VendorDetail";
import type { Bundle } from "../../types/Bundle";
import type { ServicePackage } from "../../types/ServicePackage";
import type { CartItem, CartSelectedCateringDish } from "../../types/CartItem";

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

    selectedResourceTypeId?: string | null;

    selectedCateringDishes?: CartSelectedCateringDish[];

    onEventDateChange?: (
        date: string
    ) => void;

    onClearSelectedPackage?: () => void;

    onSelectedSlotChange?: (slotId: string | null) => void;
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

function addOneDay(date: string): string {
    const [year, month, day] = date.split("-").map(Number);
    const value = new Date(year, month - 1, day);
    value.setDate(value.getDate() + 1);
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function addDays(date: string, days: number): string {
    let result = date;
    for (let i = 0; i < Math.max(0, days); i++) result = addOneDay(result);
    return result;
}

function toLocalDateTime(date: string, time: string): string {
    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    return `${date}T${normalizedTime}`;
}

function normalizeDateTimeLocal(value: string): string {
    // datetime-local is already a local wall-clock value. Do not convert through
    // toISOString(), which would shift the booking time to UTC.
    return value.length === 16 ? `${value}:00` : value;
}

const BookingCard = ({
    vendor,
    serviceId,
    bundles = [],
    selectedPackage,
    selectedResourceTypeId,
    selectedCateringDishes = [],
    onEventDateChange,
    onClearSelectedPackage,
    onSelectedSlotChange
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
        useState(() => (location.state as any)?.vendorCalendarEventDate || "");


    const [guests, setGuests] =
        useState<number | string>("");

    // Guest count is required only for catering services.
    const isCatering =
        String(vendor.category ?? "").trim().toUpperCase() === "CATERING";


    /*
     * =========================================
     * BOOKING SLOT
     * =========================================
     */

    const [slots, setSlots] =
        useState<SlotAvailability[]>([]);

    // Keep every slot visible. Incompatible options remain clickable so the
    // customer can switch selections without being trapped by a filter.
    const eligibleSlots = slots.filter(slot =>
        // Match backend validation: a slot with no explicit resourceTypeId
        // remains eligible when it is explicitly included in the package's
        // slotIds. Only reject a slot when it is assigned to a different type.
        (!selectedPackage?.resourceTypeId ||
            !slot.resourceTypeId ||
            slot.resourceTypeId === selectedPackage.resourceTypeId) &&
        (!selectedPackage?.slotIds?.length ||
            selectedPackage.slotIds.includes(slot.slotId))
    );


    const [selectedSlot, setSelectedSlot] =
        useState<SlotAvailability | null>(null);

    const isStay = ["STAY", "STAYS"].includes(String(vendor.category ?? "").trim().toUpperCase());
    const requiresSlot = isStay || selectedPackage?.requiresSlot !== false;
    const [roomQuantity, setRoomQuantity] = useState(1);
    const [customBookingFrom, setCustomBookingFrom] = useState("");
    const [customBookingTo, setCustomBookingTo] = useState("");

    useEffect(() => {
        if (!customBookingFrom || !selectedPackage) return;

        const isFixedDuration = selectedPackage.packageType === "FIXED_DURATION";
        // A STAY package can still be priced per calendar day. Only PER_NIGHT
        // (or a flat-price STAY package) uses checkout-exclusive night counting.
        const usesNightCount = selectedPackage.pricingBasis === "PER_NIGHT" ||
            (isStay && selectedPackage.pricingBasis !== "PER_DAY");
        const duration = Math.max(1, isFixedDuration
            ? (selectedPackage.includedDuration ?? 1)
            : (selectedPackage.minimumDuration ?? 1));

        // Fixed-duration packages always determine checkout. For flexible
        // packages, only provide a default when the customer has not chosen it.
        if (isFixedDuration || !customBookingTo) {
            setCustomBookingTo(addDays(customBookingFrom, usesNightCount ? duration : duration - 1));
        }
    }, [selectedPackage?.id, selectedPackage?.packageType, selectedPackage?.includedDuration,
        selectedPackage?.minimumDuration, selectedPackage?.pricingBasis, customBookingFrom, isStay]);


    const [slotsLoading, setSlotsLoading] =
        useState(false);


    const [slotError, setSlotError] =
        useState<string | null>(null);

    const [rangeAvailabilityError, setRangeAvailabilityError] =
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


    // A Resource Type change invalidates the previous slot selection even
    // when the newly selected type happens to expose a slot with the same ID.
    useEffect(() => {
        setSelectedSlot(null);
        onSelectedSlotChange?.(null);
    }, [selectedResourceTypeId]);

    useEffect(() => {
        if (!requiresSlot) {
            setSelectedSlot(null);
            return;
        }
        if (selectedSlot && selectedPackage?.slotIds?.length
            && !selectedPackage.slotIds.includes(selectedSlot.slotId)) {
            setSelectedSlot(null);
            onSelectedSlotChange?.(null);
        }
    }, [requiresSlot, selectedPackage?.id, (selectedPackage?.slotIds ?? []).join("|"), selectedSlot?.slotId]);

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
                        date,
                        selectedPackage?.resourceTypeId
                    );


            console.log(
                "Slot availability loaded:",
                data
            );


            const refreshedSlots = data ?? [];
            setSlots(refreshedSlots);
            setSelectedSlot(current => {
                if (!current) return null;
                const refreshed = refreshedSlots.find(slot => slot.slotId === current.slotId);
                return refreshed ?? current;
            });

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

    // Load slots only after a package is selected. When the package or date
    // changes, refresh availability while retaining the slot if it still exists.
    useEffect(() => {
        if (eventDate && selectedPackage && requiresSlot) {
            void loadSlotAvailability(eventDate);
        }
    }, [eventDate, selectedPackage?.id, requiresSlot, selectedResourceTypeId]);


    // Recheck every occupied date whenever the customer changes the range.
    // The final hold still performs an atomic-in-process resource allocation
    // across all exact intervals, including same-unit continuity.
    useEffect(() => {
        if (!selectedSlot || !selectedPackage) {
            setRangeAvailabilityError(null);
            return;
        }
        const from = isStay ? customBookingFrom : (customBookingFrom || eventDate);
        const to = isStay ? customBookingTo : (customBookingTo || eventDate);
        if (!from || !to || to < from) return;

        const continuous = isStay || selectedSlot.bookingPattern === "CONTINUOUS";
        const dates: string[] = [];
        let cursor = from;
        while (continuous ? cursor < to : cursor <= to) {
            dates.push(cursor);
            cursor = addOneDay(cursor);
            if (dates.length > 31) break;
        }
        if (dates.length === 0) return;

        let cancelled = false;
        Promise.all(dates.map(date =>
            BookingAvailabilityService.getSlotAvailability(
                serviceId!,
                date,
                selectedPackage?.resourceTypeId
            )
        )).then(results => {
            if (cancelled) return;
            let unavailableDate: string | null = null;
            let minimumRemaining = Number.POSITIVE_INFINITY;
            for (let i = 0; i < dates.length; i++) {
                const matching = results[i].find(item => item.slotId === selectedSlot.slotId);
                const remaining = matching?.remainingCapacity ?? 0;
                if (!matching || !matching.available || (isStay && remaining < roomQuantity)) {
                    unavailableDate = dates[i];
                    break;
                }
                minimumRemaining = Math.min(minimumRemaining, remaining);
            }
            setRangeAvailabilityError(unavailableDate
                ? `Selected slot is unavailable on ${unavailableDate}. Choose another date range or slot.`
                : null);
            setSelectedSlot(current => current?.slotId === selectedSlot.slotId
                ? { ...current, available: !unavailableDate, remainingCapacity: Number.isFinite(minimumRemaining) ? minimumRemaining : current.remainingCapacity }
                : current);
        }).catch(error => {
            if (!cancelled) {
                console.warn("Could not recheck the full booking date range:", error);
                setRangeAvailabilityError("Unable to verify availability for the full date range. Please try again.");
            }
        });
        return () => { cancelled = true; };
    }, [customBookingFrom, customBookingTo, eventDate, selectedSlot?.slotId, selectedPackage?.id, isStay, serviceId, roomQuantity]);

    // A vendor can enter this page from the bookings calendar. Load the
    // availability for the prepopulated date using the existing availability
    // path; no booking hold is created until the normal booking action runs.
    useEffect(() => {
        const calendarDate = (location.state as any)?.vendorCalendarEventDate;
        if (calendarDate && calendarDate === eventDate && serviceId) {
            void loadSlotAvailability(calendarDate);
        }
    }, [serviceId]);


    /*
     * =========================================
     * EXISTING CART HOLD HELPERS
     * =========================================
     */

    const getExistingCartItem = () =>
        serviceId
            ? CartService.getCart().find(item => item.serviceId === serviceId)
            : undefined;

    const hasReusableExistingHold = (
        slotId?: string,
        date?: string
    ): boolean => {
        const existing = getExistingCartItem();

        return Boolean(
            existing?.holdId &&
            existing.slotId === (slotId ?? selectedSlot?.slotId) &&
            existing.eventDate === (date ?? eventDate) &&
            existing.holdExpiresAt &&
            Date.parse(existing.holdExpiresAt) > Date.now()
        );
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


            if (isStay) {
                if (!customBookingFrom || !customBookingTo || customBookingTo < customBookingFrom) {
                    alert("Please select a check-in date and a check-out date on or after check-in.");
                    return false;
                }
            } else if (!eventDate) {
                alert("Please select an event date.");
                return false;
            }


            if (requiresSlot && !selectedSlot) {
                alert("Please select an available time slot.");
                return false;
            }
            if (requiresSlot && selectedSlot && !selectedSlot.available
                && !hasReusableExistingHold(selectedSlot.slotId, eventDate)) {
                alert("The selected slot is no longer available. Please select another slot.");
                return false;
            }
            if (isStay && (!selectedPackage?.maxGuestsPerRoom || selectedPackage.maxGuestsPerRoom < 1)) {
                alert("The selected stay package has no valid maximum guests per room configured.");
                return false;
            }
            if (isStay && roomQuantity < 1) {
                alert("Please select at least one room.");
                return false;
            }


            if (
                isCatering &&
                (
                    guests === "" ||
                    Number(guests) < 1
                )
            ) {

                alert(
                    "Please enter a valid guest count for catering."
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


            if (isStay) {
                if (!customBookingFrom || !customBookingTo || customBookingTo < customBookingFrom) {
                    alert("Please select a check-in date and a check-out date on or after check-in.");
                    return false;
                }
            } else if (!eventDate) {
                alert("Please select an event date.");
                return false;
            }


            if (requiresSlot && !selectedSlot) {
                alert("Please select an available time slot.");
                return false;
            }
            if (requiresSlot && selectedSlot && !selectedSlot.available
                && !hasReusableExistingHold(selectedSlot.slotId, eventDate)) {
                alert("This slot is no longer available. Please select another slot.");
                return false;
            }
            if (isStay && (!selectedPackage?.maxGuestsPerRoom || selectedPackage.maxGuestsPerRoom < 1)) {
                alert("The selected stay package has no valid maximum guests per room configured.");
                return false;
            }
            if (isStay && roomQuantity < 1) {
                alert("Please select at least one room.");
                return false;
            }


            const existingCartItem = getExistingCartItem();

            if (existingCartItem) {
                const confirmed = window.confirm(
                    `“${vendor.serviceName}” is already in your cart. Continuing will replace its current booking details.` +
                    (existingCartItem.bundleId && existingCartItem.bundleId !== bundle?.id
                        ? " The previous bundle will be broken into individual services."
                        : "") +
                    "\n\nDo you want to continue?"
                );

                if (!confirmed) {
                    return false;
                }
            }


            /*
             * For STAY, each requested room consumes one unit of the selected
             * slot capacity. Other categories keep the existing one-item quantity.
             */
            const quantity = isStay ? roomQuantity : 1;
            const cartId =
                CartService.getOrCreateCartId();

            /*
             * =========================================
             * CREATE TEMPORARY HOLD
             * =========================================
             */

            let newHoldId: string | undefined;

            try {

                setHoldingSlot(true);

                const rangeFrom = isStay ? customBookingFrom : (customBookingFrom || eventDate);
                const rangeTo = isStay ? customBookingTo : (customBookingTo || eventDate);
                const recurring = !isStay && selectedSlot?.bookingPattern !== "CONTINUOUS";
                const intervalDates: string[] = [];
                if (rangeFrom && rangeTo && rangeTo >= rangeFrom) {
                    let cursor = rangeFrom;
                    while (cursor <= rangeTo) {
                        intervalDates.push(cursor);
                        cursor = addOneDay(cursor);
                        if (intervalDates.length > 31) throw new Error("Bookings cannot exceed 31 calendar days.");
                    }
                }
                const stayContinuous = isStay && selectedSlot?.bookingPattern === "CONTINUOUS";
                const stayDates = intervalDates.filter(date =>
                    customBookingFrom === customBookingTo ? date === customBookingFrom : date < customBookingTo
                );
                const stayIntervals = isStay
                    ? (stayContinuous
                        ? [{
                            from: toLocalDateTime(customBookingFrom, selectedSlot!.startTime),
                            to: toLocalDateTime(
                                customBookingTo,
                                selectedSlot!.endTime
                            )
                        }]
                        : stayDates.map(date => ({
                            from: toLocalDateTime(date, selectedSlot!.startTime),
                            to: toLocalDateTime(
                                selectedSlot!.endTime <= selectedSlot!.startTime ? addOneDay(date) : date,
                                selectedSlot!.endTime
                            )
                        })))
                    : [];
                const bookingIntervals = isStay
                    ? stayIntervals
                    : recurring
                        ? intervalDates.map(date => ({
                            from: toLocalDateTime(date, selectedSlot!.startTime),
                            to: toLocalDateTime(
                                selectedSlot!.endTime <= selectedSlot!.startTime ? addOneDay(date) : date,
                                selectedSlot!.endTime
                            )
                        }))
                        : [{
                            from: toLocalDateTime(rangeFrom, selectedSlot!.startTime),
                            to: toLocalDateTime(rangeTo, selectedSlot!.endTime)
                        }];
                if (!bookingIntervals.length) {
                    throw new Error("Please select a valid stay date range and booking slot.");
                }
                const bookingFrom = bookingIntervals[0].from;
                const bookingTo = bookingIntervals[bookingIntervals.length - 1].to;
                const holdSlotId = selectedSlot?.slotId;
                const canReuseHold = Boolean(existingCartItem?.holdId &&
                    existingCartItem.slotId === holdSlotId &&
                    existingCartItem.packageId === selectedPackage?.id &&
                    existingCartItem.bookingFrom === bookingFrom &&
                    existingCartItem.bookingTo === bookingTo &&
                    (existingCartItem.roomQuantity ?? 1) === (isStay ? roomQuantity : 1) &&
                    existingCartItem.holdExpiresAt && Date.parse(existingCartItem.holdExpiresAt) > Date.now());

                const hold = canReuseHold
                    ? { holdId: existingCartItem!.holdId!, expiresAt: existingCartItem!.holdExpiresAt! }
                    : await BookingAvailabilityService.holdSlot({
                        cartId,
                        serviceId,
                        slotId: holdSlotId,
                        packageId: selectedPackage?.id,
                        resourceTypeId: selectedPackage?.resourceTypeId,
                        bookingFrom,
                        bookingTo,
                        bookingType: isStay ? "ROOM_STAY" : "STANDARD_SLOT",
                        roomQuantity: isStay ? roomQuantity : undefined,
                        quantity
                    });

                if (!canReuseHold) {
                    newHoldId = hold.holdId;
                }

                console.log(
                    canReuseHold
                        ? "Reusing the existing booking hold:"
                        : "Booking hold created:",
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

                    price: selectedPackage
                        ? (selectedPackage.packageType === "FIXED_DURATION" ? Number(selectedPackage.price) : Number(selectedPackage.price) * (
                            selectedPackage.pricingBasis === "PER_NIGHT"
                                ? Math.max(1, Math.round((new Date(`${rangeTo}T00:00:00`).getTime() - new Date(`${rangeFrom}T00:00:00`).getTime()) / 86400000))
                                : selectedPackage.pricingBasis === "PER_DAY"
                                    ? Math.max(1, Math.round((new Date(`${rangeTo}T00:00:00`).getTime() - new Date(`${rangeFrom}T00:00:00`).getTime()) / 86400000) + 1)
                                    : 1
                        ))
                        : Number(vendor.startingPrice),

                    quantity,

                    image:
                        getVendorImage(
                            vendor
                        ),

                    eventDate: isStay ? undefined : (eventDate || bookingFrom.slice(0, 10)),
                    bookingFrom,
                    bookingTo,
                    bookingIntervals,
                    bookingDuration: intervalDates.length,
                    pricingBasis: selectedPackage?.pricingBasis ?? "FIXED",
                    bookingType: isStay ? "ROOM_STAY" : "STANDARD_SLOT",
                    roomQuantity: isStay ? roomQuantity : undefined,

                    guestCount:
                        isCatering && guests !== ""
                            ? Number(guests)
                            : undefined,


                    /*
                     * =========================================
                     * SLOT SNAPSHOT
                     * =========================================
                     */

                    slotId: holdSlotId,
                    slotName: selectedSlot?.slotName,
                    slotStartTime: selectedSlot?.startTime,
                    slotEndTime: selectedSlot?.endTime,


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
                        selectedPackage?.packageType === "FIXED_DURATION"
                            ? "FIXED_DURATION"
                            : selectedPackage?.name?.toUpperCase() === "SILVER"
                            ? "SILVER"
                            : selectedPackage?.name?.toUpperCase() === "GOLD"
                                ? "GOLD"
                                : selectedPackage?.name?.toUpperCase() === "PREMIUM"
                                    ? "PREMIUM"
                                    : undefined,

                    packagePrice:
                        selectedPackage
                            ? Number(selectedPackage.price)
                            : undefined,

                    includedDuration: selectedPackage?.packageType === "FIXED_DURATION" ? selectedPackage.includedDuration : undefined,

                    packageFeatures:
                        selectedPackage?.features,

                    selectedCateringDishes:
                        selectedCateringDishes,


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


                await CartService.replaceItem(
                    cartItem
                );


                return true;

            } catch (error: any) {

                // If cart persistence failed after a new hold was created,
                // release that unassociated hold. The old cart item remains.
                if (newHoldId) {
                    await BookingAvailabilityService
                        .releaseHold(serviceId, newHoldId)
                        .catch(releaseError =>
                            console.warn(
                                "Could not release the unassociated replacement hold:",
                                releaseError
                            )
                        );
                }

                console.error(
                    "Failed to hold booking slot:",
                    {
                        status: error?.response?.status,
                        response: error?.response?.data,
                        request: { serviceId, slotId: requiresSlot ? selectedSlot?.slotId : undefined, packageId: selectedPackage?.id, eventDate, bookingFrom: customBookingFrom, bookingTo: customBookingTo, quantity },
                        error
                    }
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

                if (requiresSlot) {
                    await loadSlotAvailability(eventDate);
                }


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
            const from = isStay ? customBookingFrom : (customBookingFrom || eventDate);
            const to = isStay ? customBookingTo : (customBookingTo || eventDate);
            if (!from || !to || to < from ||
                (!isStay && selectedSlot?.bookingPattern === "CONTINUOUS" && to <= from)) {
                toast.error("Please select a valid booking date range. Continuous bookings require a checkout date after check-in.");
                return;
            }
            const dateDifference = Math.round(
                (new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86400000
            );
            const usesNightCount = selectedPackage?.pricingBasis === "PER_NIGHT" ||
                (isStay && selectedPackage?.pricingBasis !== "PER_DAY") ||
                selectedSlot?.bookingPattern === "CONTINUOUS";
            const duration = Math.max(1, usesNightCount ? dateDifference : dateDifference + 1);
            if (selectedPackage?.packageType === "FIXED_DURATION" && duration !== selectedPackage.includedDuration) {
                toast.error(`This package is fixed at ${selectedPackage.includedDuration} ${isStay ? "nights" : "days"}. The checkout date is calculated automatically.`);
                return;
            }
            if (duration < (selectedPackage?.minimumDuration ?? 1) ||
                duration > (selectedPackage?.maximumDuration ?? 31)) {
                toast.error(`This package allows bookings between ${selectedPackage?.minimumDuration ?? 1} and ${selectedPackage?.maximumDuration ?? 31} ${selectedPackage?.pricingBasis === "PER_NIGHT" || (isStay && selectedPackage?.pricingBasis !== "PER_DAY") ? "nights" : "days"}.`);
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
                    {Number(selectedPackage
                        ? (selectedPackage.packageType === "FIXED_DURATION"
                            ? selectedPackage.price
                            : Number(selectedPackage.price) * (selectedPackage.pricingBasis === "PER_NIGHT"
                                ? Math.max(1, Math.round((new Date(`${customBookingTo || customBookingFrom || eventDate}T00:00:00`).getTime() - new Date(`${customBookingFrom || eventDate}T00:00:00`).getTime()) / 86400000))
                                : selectedPackage.pricingBasis === "PER_DAY" ? Math.max(1, Math.round((new Date(`${customBookingTo || customBookingFrom || eventDate}T00:00:00`).getTime() - new Date(`${customBookingFrom || eventDate}T00:00:00`).getTime()) / 86400000) + 1) : 1))
                        : vendor.startingPrice).toLocaleString("en-IN")}
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


                {isStay ? (
                    <div className="stay-flexible-booking-fields">
                        <label htmlFor="stay-booking-from">From Date (Check-in)</label>
                        <input
                            id="stay-booking-from"
                            type="date"
                            min={getTomorrowDate()}
                            value={customBookingFrom}
                            onChange={async e => {
                                const from = e.target.value;
                                const oldFrom = customBookingFrom || eventDate;
                                const oldTo = customBookingTo;
                                const oldSpan = oldFrom && oldTo
                                    ? Math.round((new Date(`${oldTo}T00:00:00`).getTime() - new Date(`${oldFrom}T00:00:00`).getTime()) / 86400000)
                                    : 0;
                                const isFixedDuration = selectedPackage?.packageType === "FIXED_DURATION";
                                const usesNightCount = selectedPackage?.pricingBasis === "PER_NIGHT" ||
                                    (isStay && selectedPackage?.pricingBasis !== "PER_DAY");
                                const duration = Math.max(1, isFixedDuration
                                    ? (selectedPackage?.includedDuration ?? 1)
                                    : (oldSpan > 0
                                        ? (usesNightCount ? oldSpan : oldSpan + 1)
                                        : (selectedPackage?.minimumDuration ?? 1)));
                                setCustomBookingFrom(from);
                                setEventDate(from);
                                if (selectedPackage) {
                                    setCustomBookingTo(addDays(from, usesNightCount ? duration : duration - 1));
                                } else {
                                    // Do not invent a checkout date before a package is selected.
                                    setCustomBookingTo("");
                                }
                                setSlotError(null);
                                onEventDateChange?.(from);

                            }}
                        />
                        <label htmlFor="stay-booking-to">To Date (Check-out)</label>
                        <input
                            id="stay-booking-to"
                            type="date"
                            min={customBookingFrom || getTomorrowDate()}
                            value={customBookingTo}
                            readOnly={selectedPackage?.packageType === "FIXED_DURATION"}
                            onChange={e => { if (selectedPackage?.packageType !== "FIXED_DURATION") setCustomBookingTo(e.target.value); }}
                        />
                    </div>
                ) : (
                    <>
                        <label>From Date</label>
                        <input
                            type="date"
                            value={eventDate}
                            min={getTomorrowDate()}
                            onChange={async (e) => {
                                const date = e.target.value;
                                const oldFrom = customBookingFrom || eventDate;
                                const oldTo = customBookingTo || oldFrom;
                                const oldSpan = oldFrom && oldTo
                                    ? Math.max(1, Math.round((new Date(`${oldTo}T00:00:00`).getTime() - new Date(`${oldFrom}T00:00:00`).getTime()) / 86400000))
                                    : 1;
                                const continuous = selectedSlot?.bookingPattern === "CONTINUOUS" || selectedPackage?.pricingBasis === "PER_NIGHT";
                                const rawSpan = oldFrom && oldTo
                                    ? Math.round((new Date(`${oldTo}T00:00:00`).getTime() - new Date(`${oldFrom}T00:00:00`).getTime()) / 86400000)
                                    : 0;
                                const durationUnits = rawSpan > 0
                                    ? (continuous ? rawSpan : rawSpan + 1)
                                    : (selectedPackage?.packageType === "FIXED_DURATION" ? (selectedPackage.includedDuration ?? 1) : (selectedPackage?.minimumDuration ?? 1));
                                setEventDate(date);
                                setCustomBookingFrom(date);
                                setCustomBookingTo(addDays(date, continuous ? durationUnits : durationUnits - 1));
                                setSlotError(null);
                                onEventDateChange?.(date);

                            }}
                        />
                        <label>To Date</label>
                        <input
                            type="date"
                            value={customBookingTo || eventDate}
                            min={eventDate || getTomorrowDate()}
                            readOnly={selectedPackage?.packageType === "FIXED_DURATION"}
                            onChange={e => { if (selectedPackage?.packageType !== "FIXED_DURATION") setCustomBookingTo(e.target.value); }}
                        />
                        <p className="package-eligibility-help">
                            Select a date range. Availability is checked for every occupied session.
                        </p>
                    </>
                )}

                {
                    eventDate && selectedPackage && requiresSlot && (
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

                                ) : eligibleSlots.length === 0 ? (

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
                                            eligibleSlots.map(
                                                slot => {
                                                    const incompatibleWithPackage = Boolean(
                                                        selectedPackage?.slotIds?.length &&
                                                        !selectedPackage.slotIds.includes(slot.slotId)
                                                    );

                                                    const isSelected =
                                                        selectedSlot?.slotId ===
                                                        slot.slotId;


                                                    const insufficientRoomCapacity = isStay &&
                                                        (slot.remainingCapacity ?? 0) < roomQuantity;
                                                    const unavailable =
                                                        ( !slot.available || insufficientRoomCapacity ) &&
                                                        !hasReusableExistingHold(
                                                            slot.slotId,
                                                            eventDate
                                                        );


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
                                                                } ${
                                                                    incompatibleWithPackage
                                                                        ? "incompatible"
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


                                                                if (incompatibleWithPackage) {
                                                                    onClearSelectedPackage?.();
                                                                }
                                                                setSelectedSlot(slot);
                                                                onSelectedSlotChange?.(slot.slotId);
                                                                const minUnits = Math.max(1, selectedPackage?.minimumDuration ?? 1);
                                                                const continuous = slot.bookingPattern === "CONTINUOUS";
                                                                const nights = selectedPackage?.pricingBasis === "PER_NIGHT" ||
                                                                    (isStay && selectedPackage?.pricingBasis !== "PER_DAY");
                                                                setCustomBookingFrom(eventDate);
                                                                if (!customBookingTo || customBookingTo === eventDate) {
                                                                    setCustomBookingTo(addDays(eventDate, continuous || nights ? minUnits : minUnits - 1));
                                                                }

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


                            {rangeAvailabilityError && (
                                <div className="slot-error">{rangeAvailabilityError}</div>
                            )}
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

                {isStay && (
                    <div className="stay-flexible-booking-fields">
                        <label htmlFor="stay-room-quantity">Number of rooms</label>
                        <input
                            id="stay-room-quantity"
                            type="number"
                            min="1"
                            value={roomQuantity}
                            onChange={e => setRoomQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                        />
                        <p className="package-eligibility-help">
                            {selectedPackage?.maxGuestsPerRoom
                                ? `This package allows up to ${selectedPackage.maxGuestsPerRoom} guests per room.`
                                : "The vendor has not configured the maximum guests per room for this package."}
                        </p>
                        {selectedSlot && (
                            <p className="package-eligibility-help">
                                {selectedSlot.remainingCapacity ?? 0} room(s) currently available for this slot on the check-in date. You requested {roomQuantity}. Availability is checked against the same Resource Type and slot time for every night of the stay.
                            </p>
                        )}
                    </div>
                )}

                {isCatering && (
                    <>
                        <label>
                            Guests
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={guests}
                            onChange={(e) =>
                                setGuests(e.target.value)
                            }
                            placeholder="Enter number of guests"
                        />
                    </>
                )}


                <button
                    className="book-button"
                    type="button"
                    onClick={handleBooking}
                    disabled={
                        !selectedPackage ||
                        (requiresSlot && !selectedSlot) ||
                        (requiresSlot && selectedSlot && (!selectedSlot.available || (isStay && (selectedSlot.remainingCapacity ?? 0) < roomQuantity)) && !hasReusableExistingHold(selectedSlot.slotId, eventDate)) ||
                        (isStay && (!customBookingFrom || !customBookingTo || customBookingTo < customBookingFrom)) ||
                        holdingSlot ||
                        (requiresSlot && slotsLoading) ||
                        Boolean(rangeAvailabilityError)
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